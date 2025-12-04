// producer_user_cs445k.js - Read from CS445K Restaurant DB
import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import CS445KUser from './models/cs445k-source/user.source.model.js';

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = 'staging_user';
    await channel.assertQueue(QUEUE, { durable: true });

    console.log('📡 Fetching users from CS445K Restaurant DB...');

    const cursor = CS445KUser.find({}, {
        name: 1,
        email: 1,
        mobile: 1,
        status: 1,
        role: 1,
        createdAt: 1,
    }).lean().cursor({ batchSize: 500 });

    let count = 0;
    for await (const u of cursor) {
        const msg = {
            customer_id: u._id?.toString(),
            name: u.name || '',
            email: u.email || '',
            phone: u.mobile || '',
            tier: 'BRONZE',  // Default tier (CS445K doesn't have tier)
            status: u.status || 'Active',
            created_at: u.createdAt ? new Date(u.createdAt).toISOString() : null
        };

        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
        count++;
        console.log(`📤 User ${count}: ${msg.email || msg.customer_id}`);
    }

    console.log(`✅ Published ${count} users from CS445K Restaurant DB`);

    // Give RabbitMQ time to flush
    setTimeout(() => process.exit(0), 500);
}

main().catch((err) => {
    console.error('❌ Error in producer_user_cs445k:', err);
    process.exit(1);
});
