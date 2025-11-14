import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRabbitMQ } from './config/rabbitmq.js';
import connectDB from './config/connectDB.js';
import User from './models/user.model.js';

await connectDB();
const ch = await connectRabbitMQ();
const QUEUE = 'staging_user';
await ch.assertQueue(QUEUE, { durable: true });

const cursor = User.find({}, {
    name: 1, email: 1, mobile: 1, status: 1, createdAt: 1, 'membership.level': 1
}).lean().cursor({ batchSize: 500 });

for await (const u of cursor) {
    const msg = {
        customer_id: u._id?.toString(),
        name: u.name || '',
        email: u.email || '',
        phone: u.mobile || '',
        tier: u.membership?.level || 'BRONZE',
        status: u.status || 'Active',
        created_at: u.createdAt ? new Date(u.createdAt).toISOString() : null
    };
    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
    console.log('📤 user ->', msg.email || msg.customer_id);
}

console.log('✅ published users from Mongo'); process.exit(0);
