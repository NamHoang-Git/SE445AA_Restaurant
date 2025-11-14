import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import connectDB from './config/connectDB.js';
import Product from './models/product.model.js';

await connectDB();
const ch = await connectRabbitMQ();
const QUEUE = 'staging_product';
await ch.assertQueue(QUEUE, { durable: true });

const cursor = Product.find({}, {
    name: 1, price: 1, discount: 1, publish: 1, category: 1, subCategory: 1, slug: 1, createdAt: 1
}).lean().cursor({ batchSize: 500 });

for await (const p of cursor) {
    const msg = {
        product_id: p._id?.toString(),
        name: p.name || '',
        price: Number.isFinite(p.price) ? p.price : null,
        discount: Number.isFinite(p.discount) ? p.discount : 0,
        publish: !!p.publish,
        category_ids: Array.isArray(p.category) ? p.category.map(id => id?.toString()) : [],
        sub_category_id: p.subCategory ? p.subCategory.toString() : null,
        slug: p.slug || null,
        created_at: p.createdAt ? new Date(p.createdAt).toISOString() : null
    };
    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
    console.log('📤 product ->', msg.name || msg.product_id);
}

console.log('✅ published products from Mongo'); process.exit(0);
