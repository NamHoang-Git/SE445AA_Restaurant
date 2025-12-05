// producer_product_cs445k_v2.js - Enhanced with incremental load
import 'dotenv/config';
import amqp from 'amqplib';
import CS445KProduct from './models/cs445k-source/product.source.model.js';
import { getLastRunTimestamp, updateEtlMetadata, markEtlRunning } from './utils/etl_helper.js';
import connectDB from './config/connectDB.js';

const QUEUE_NAME = 'staging_products';
const SOURCE_NAME = 'products';

async function produceProducts(runType = 'full') {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsFailed = 0;

    try {
        await connectDB();
        await markEtlRunning(SOURCE_NAME);

        // Build query for incremental
        let query = {};
        if (runType === 'incremental') {
            const lastRun = await getLastRunTimestamp(SOURCE_NAME);
            if (lastRun) {
                query = { updatedAt: { $gt: lastRun } };
                console.log(`📅 Incremental load: fetching products updated after ${lastRun}`);
            } else {
                console.log('⚠️  No previous run found, falling back to full load');
                runType = 'full';
            }
        }

        if (runType === 'full') {
            console.log('🔄 Full load: fetching all products');
        }

        const products = await CS445KProduct.find(query).lean();
        console.log(`✅ Found ${products.length} products to process`);

        if (products.length === 0) {
            console.log('ℹ️  No new products to process');
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

        for (const product of products) {
            try {
                const message = {
                    product_id: product._id.toString(),
                    name: product.name || '',
                    price: product.price || 0,
                    discount: product.discount || 0,
                    publish: product.publish !== false,
                    category_ids: Array.isArray(product.category) ? product.category : [product.category].filter(Boolean),
                    sub_category_id: product.subCategory?.toString() || '',
                    slug: product.slug || '',
                    created_at: product.createdAt || new Date()
                };

                channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                    persistent: true
                });
                recordsProcessed++;
            } catch (err) {
                console.error(`Error processing product ${product._id}:`, err.message);
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

        console.log(`✅ Published ${recordsProcessed} products to queue`);
        console.log(`⏱️  Duration: ${durationMs}ms`);
        if (recordsFailed > 0) {
            console.log(`⚠️  Failed: ${recordsFailed} products`);
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

produceProducts(runType)
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
