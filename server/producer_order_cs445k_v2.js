// producer_order_cs445k_v2.js - Enhanced with incremental load
import 'dotenv/config';
import amqp from 'amqplib';
import CS445KOrder from './models/cs445k-source/order.source.model.js';
import { getLastRunTimestamp, updateEtlMetadata, markEtlRunning } from './utils/etl_helper.js';
import connectDB from './config/connectDB.js';

const QUEUE_NAME = 'staging_order_items';
const SOURCE_NAME = 'orders';

async function produceOrders(runType = 'full') {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsFailed = 0;

    try {
        await connectDB();
        await markEtlRunning(SOURCE_NAME);

        let query = {};
        if (runType === 'incremental') {
            const lastRun = await getLastRunTimestamp(SOURCE_NAME);
            if (lastRun) {
                query = { updatedAt: { $gt: lastRun } };
                console.log(`📅 Incremental load: fetching orders updated after ${lastRun}`);
            } else {
                console.log('⚠️  No previous run found, falling back to full load');
                runType = 'full';
            }
        }

        if (runType === 'full') {
            console.log('🔄 Full load: fetching all orders');
        }

        const orders = await CS445KOrder.find(query).lean();
        console.log(`✅ Found ${orders.length} orders to process`);

        if (orders.length === 0) {
            console.log('ℹ️  No new orders to process');
            await updateEtlMetadata(SOURCE_NAME, {
                status: 'success',
                recordsProcessed: 0,
                recordsFailed: 0,
                runType,
                durationMs: Date.now() - startTime
            });
            return;
        }

        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        for (const order of orders) {
            try {
                const orderItems = order.orderItems || [];

                for (const item of orderItems) {
                    // Support both productDetails (camelCase) and product_details (snake_case)
                    const productDetails = item.productDetails || item.product_details || {};

                    // Try multiple fields for product_id
                    let product_id = item.productId ||
                        productDetails.productId ||
                        productDetails._id ||
                        item.product_id;

                    if (!product_id) {
                        console.warn(`⚠️  Skipping order ${order._id}: no product_id found`);
                        recordsFailed++;
                        continue;
                    }

                    const message = {
                        order_id: order._id.toString(),
                        customer_id: order.userId?.toString() || '',
                        product_id: product_id.toString(),
                        product_name: productDetails.name || item.name || '',
                        quantity: item.quantity || 1,
                        unit_price: productDetails.price || item.price || 0,
                        subtotal: item.subtotal || item.totalPrice || 0,
                        discount: item.discount || 0,
                        total: item.subtotal || item.totalPrice || 0,
                        payment_method: order.payment_method || 'cash',
                        payment_status: order.payment_status || 'pending',
                        order_status: order.order_status || 'pending',
                        ordered_at: order.createdAt || new Date(),
                        completed_at: order.updatedAt || null,
                        voucher_id: order.voucherId?.toString() || null,
                        table_number: order.tableNumber || null
                    };

                    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                        persistent: true
                    });
                    recordsProcessed++;
                }
            } catch (err) {
                console.error(`Error processing order ${order._id}:`, err.message);
                recordsFailed++;
            }
        }

        await channel.close();
        await connection.close();

        const durationMs = Date.now() - startTime;
        await updateEtlMetadata(SOURCE_NAME, {
            status: 'success',
            recordsProcessed,
            recordsFailed,
            runType,
            durationMs
        });

        console.log(`✅ Published ${recordsProcessed} order items to queue`);
        console.log(`⏱️  Duration: ${durationMs}ms`);
        if (recordsFailed > 0) {
            console.log(`⚠️  Failed: ${recordsFailed} orders`);
        }

    } catch (err) {
        console.error('❌ Error in producer:', err);
        await updateEtlMetadata(SOURCE_NAME, {
            status: 'failed',
            recordsProcessed,
            recordsFailed,
            runType,
            durationMs: Date.now() - startTime
        });
        throw err;
    }
}

const args = process.argv.slice(2);
const runType = args.includes('--incremental') ? 'incremental' : 'full';

produceOrders(runType)
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
