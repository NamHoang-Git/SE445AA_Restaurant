// producer_order.js
import fs from 'fs';
import csv from 'csv-parser';
import { connectRabbitMQ } from './config/rabbitmq.js';

const channel = await connectRabbitMQ();
const QUEUE = 'staging_order';
await channel.assertQueue(QUEUE, { durable: true });

fs.createReadStream('./data/orders.csv')
  .pipe(csv())
  .on('data', (row) => {
    const num = (v) => (v === '' || v == null ? null : Number(v));

    const msg = {
      order_id: row.order_id,
      customer_id: row.customer_id || null,
      product_id: row.product_id || null,
      product_name: row.product_name || '',
      quantity: num(row.quantity),
      unit_price: num(row.unit_price),
      subtotal: num(row.subtotal),
      discount: num(row.discount) ?? 0,
      total: num(row.total),
      payment_method: row.payment_method || 'CASH',
      payment_status: row.payment_status || 'UNPAID',
      order_status: row.order_status || 'PENDING',
      ordered_at: row.ordered_at || null,
      completed_at: row.completed_at || null,
      voucher_id: row.voucher_id || null,
      table_number: row.table_number || null,
    };

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(msg)),
      { persistent: true }
    );
    console.log('📤 Sent order item:', msg.order_id, msg.product_id);
  })
  .on('end', () => {
    console.log('✅ All orders from CSV published!');
    process.exit(0);
  });
