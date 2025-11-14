import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import WhExport from './models/warehouse-source/whExport.source.model.js';

const channel = await connectRabbitMQ();
const QUEUE = 'staging_wh_export';
await channel.assertQueue(QUEUE, { durable: true });

const exports = await WhExport.find({}).lean();

if (!exports.length) {
    console.warn('⚠️ Không có dữ liệu xuất kho (wh_exports) trong source');
    process.exit(0);
}

for (const row of exports) {
    const msg = {
        export_id: row.export_code,
        product_id: row.product_code,
        quantity: row.quantity,
        reason: row.reason,
        export_date: row.export_date,
    };

    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(msg)),
        { persistent: true }
    );

    console.log('📤 WH export ->', msg.export_id, msg.product_id);
}

console.log('✅ All warehouse exports sent from source Mongo!');
process.exit(0);
