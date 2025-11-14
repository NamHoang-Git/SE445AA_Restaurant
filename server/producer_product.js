// producer_product.js
import fs from 'fs';
import csv from 'csv-parser';
import { connectRabbitMQ } from './config/rabbitmq.js';

const channel = await connectRabbitMQ();
const QUEUE = 'staging_product';
await channel.assertQueue(QUEUE, { durable: true });

fs.createReadStream('./data/products.csv')
  .pipe(csv())
  .on('data', (row) => {
    const msg = {
      product_id: row.product_id,
      name: row.name,
      price: row.price ? Number(row.price) : null,
      discount: row.discount ? Number(row.discount) : 0,
      publish: String(row.publish).toLowerCase() === 'true',
      category_ids: row.category_ids
        ? row.category_ids.split('|').map((x) => x.trim())
        : [],
      sub_category_id: row.sub_category_id || null,
      slug: row.slug || null,
      created_at: row.created_at || null,
    };

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(msg)),
      { persistent: true }
    );
    console.log('📤 Sent product:', msg.name || msg.product_id);
  })
  .on('end', () => {
    console.log('✅ All products from CSV published!');
    process.exit(0);
  });
