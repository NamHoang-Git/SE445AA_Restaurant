import 'dotenv/config';
import { connectRabbitMQ } from './config/rabbitmq.js';
import WhImport from './models/warehouse-source/whImport.source.model.js';

const channel = await connectRabbitMQ();
const QUEUE = 'staging_wh_import';
await channel.assertQueue(QUEUE, { durable: true });

const imports = await WhImport.find({}).lean();

if (!imports.length) {
    console.warn('⚠️ Không có dữ liệu nhập kho (wh_imports) trong source');
    process.exit(0);
}

for (const row of imports) {
    const msg = {
        import_id: row.import_code,
        product_id: row.product_code,
        quantity: row.quantity,
        unit_cost: row.unit_cost,
        import_date: row.import_date,
        supplier: row.supplier,
    };

    channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(msg)),
        { persistent: true }
    );

    console.log('📤 WH import ->', msg.import_id, msg.product_id);
}

console.log('✅ All warehouse imports sent from source Mongo!');
process.exit(0);
