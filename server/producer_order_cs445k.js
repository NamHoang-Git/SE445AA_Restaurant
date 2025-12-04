// producer_order_cs445k.js - Read from CS445K Restaurant DB
import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import CS445KOrder from './models/cs445k-source/order.source.model.js';

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = 'staging_order';
    await channel.assertQueue(QUEUE, { durable: true });

    console.log('📡 Fetching orders from CS445K Restaurant DB...');

    const cursor = CS445KOrder.find({}, {
        orderId: 1,
        userId: 1,
        productId: 1,
        product_details: 1,
        paymentId: 1,
        payment_status: 1,
        subTotalAmt: 1,
        totalAmt: 1,
        createdAt: 1,
        updatedAt: 1,
    }).lean().cursor({ batchSize: 500 });

    let count = 0;
    let skipped = 0;

    for await (const o of cursor) {
        const productDetails = o.product_details || {};

        // Try to get product_id from multiple sources
        const productId = productDetails.productId?.toString()
            || o.productId?.toString()
            || productDetails._id?.toString()
            || null;

        // Skip orders without product_id (can't process them)
        if (!productId) {
            console.warn(`⚠️  Skipping order ${o.orderId || o._id}: No product_id found`);
            skipped++;
            continue;
        }

        // Get quantity and price with fallbacks
        const quantity = productDetails.quantity || 1;
        const unitPrice = productDetails.price || 0;
        const total = o.totalAmt || (quantity * unitPrice);

        const msg = {
            order_id: o.orderId || o._id?.toString(),
            customer_id: o.userId?.toString() || null,
            product_id: productId,  // Now guaranteed to exist
            product_name: productDetails.name || '',
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: o.subTotalAmt || (quantity * unitPrice),
            discount: 0,  // CS445K doesn't have order-level discount
            total: total,
            payment_method: 'CASH',  // Default (CS445K doesn't store this)
            payment_status: o.payment_status || 'UNPAID',
            order_status: 'COMPLETED',  // Assume completed if in DB
            ordered_at: o.createdAt ? new Date(o.createdAt).toISOString() : null,
            completed_at: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
            voucher_id: null,
            table_number: null,
        };

        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
        count++;

        if (count <= 3) {
            console.log(`📤 Order ${count}: ${msg.order_id} - Product: ${msg.product_id}`);
        }
    }

    console.log(`✅ Published ${count} orders from CS445K Restaurant DB`);
    if (skipped > 0) {
        console.warn(`⚠️  Skipped ${skipped} orders (missing product_id)`);
    }

    // Give RabbitMQ time to flush
    setTimeout(() => process.exit(0), 500);
}

main().catch((err) => {
    console.error('❌ Error in producer_order_cs445k:', err);
    process.exit(1);
});
