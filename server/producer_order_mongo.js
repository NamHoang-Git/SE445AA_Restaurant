import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRabbitMQ } from './config/rabbitmq.js';
import connectDB from './config/connectDB.js';
import Order from './models/order.model.js';

await connectDB();
const ch = await connectRabbitMQ();
const QUEUE = 'staging_order';
await ch.assertQueue(QUEUE, { durable: true });

const projection = {
    userId: 1, items: 1, subtotal: 1, discount: 1, total: 1,
    paymentMethod: 1, paymentStatus: 1, orderStatus: 1,
    orderTime: 1, completedTime: 1, voucherId: 1, tableNumber: 1
};

const cursor = Order.find({}, projection).lean().cursor({ batchSize: 200 });

for await (const o of cursor) {
    const base = {
        order_id: o._id?.toString(),
        customer_id: o.userId ? o.userId.toString() : null,
        subtotal: Number.isFinite(o.subtotal) ? o.subtotal : null,
        discount: Number.isFinite(o.discount) ? o.discount : 0,
        total: Number.isFinite(o.total) ? o.total : null,
        payment_method: o.paymentMethod || 'CASH',
        payment_status: o.paymentStatus || 'UNPAID',
        order_status: o.orderStatus || 'PENDING',
        ordered_at: o.orderTime ? new Date(o.orderTime).toISOString() : null,
        completed_at: o.completedTime ? new Date(o.completedTime).toISOString() : null,
        voucher_id: o.voucherId ? o.voucherId.toString() : null,
        table_number: o.tableNumber ?? null
    };

    for (const it of (o.items || [])) {
        const msg = {
            ...base,
            product_id: it.productId ? it.productId.toString() : null,
            product_name: it.name || '',
            quantity: Number.isFinite(it.quantity) ? it.quantity : null,
            unit_price: Number.isFinite(it.price) ? it.price : null
        };
        ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
    }
    console.log('📤 order ->', base.order_id, 'items:', o.items?.length ?? 0);
}

console.log('✅ published orders (flattened) from Mongo'); process.exit(0);
