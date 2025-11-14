// producer_user.js
import fs from 'fs';
import csv from 'csv-parser';
import { connectRabbitMQ } from './config/rabbitmq.js';

const channel = await connectRabbitMQ();
const QUEUE = 'staging_user';
await channel.assertQueue(QUEUE, { durable: true });

fs.createReadStream('./data/users.csv')
  .pipe(csv())
  .on('data', (row) => {
    const msg = {
      customer_id: row.customer_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      tier: row.tier || 'BRONZE',
      status: row.status || 'Active',
      created_at: row.created_at || null,
    };

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(msg)),
      { persistent: true }
    );
    console.log('📤 Sent user:', msg.email || msg.customer_id);
  })
  .on('end', () => {
    console.log('✅ All users from CSV published!');
    process.exit(0);
  });
