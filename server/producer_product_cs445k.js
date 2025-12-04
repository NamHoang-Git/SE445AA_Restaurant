// producer_product_cs445k.js - Read from CS445K Restaurant DB
import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import CS445KProduct from './models/cs445k-source/product.source.model.js';

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = 'staging_product';
    await channel.assertQueue(QUEUE, { durable: true });

    console.log('📡 Fetching products from CS445K Restaurant DB...');

    const cursor = CS445KProduct.find({}, {
        name: 1,
        category: 1,
        subCategory: 1,
        price: 1,
        discount: 1,
        publish: 1,
        createdAt: 1,
    }).lean().cursor({ batchSize: 500 });

    let count = 0;
    for await (const p of cursor) {
        const msg = {
            product_id: p._id?.toString(),
            name: p.name || '',
            price: p.price || 0,
            discount: p.discount || 0,
            publish: p.publish !== false,  // Default true
            category_ids: Array.isArray(p.category) ? p.category.map(c => c.toString()) : [],
            sub_category_id: p.subCategory && p.subCategory[0] ? p.subCategory[0].toString() : null,
            slug: null,
            created_at: p.createdAt ? new Date(p.createdAt).toISOString() : null
        };

        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
        count++;
        console.log(`📤 Product ${count}: ${msg.name || msg.product_id}`);
    }

    console.log(`✅ Published ${count} products from CS445K Restaurant DB`);

    // Give RabbitMQ time to flush
    setTimeout(() => process.exit(0), 500);
}

main().catch((err) => {
    console.error('❌ Error in producer_product_cs445k:', err);
    process.exit(1);
});
