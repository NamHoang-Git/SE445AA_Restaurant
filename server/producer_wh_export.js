import "dotenv/config";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import WhExport from "./models/warehouse-source/whExport.source.model.js";

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = "staging_wh_export";

    await channel.assertQueue(QUEUE, { durable: true });

    const exports = await WhExport.find({}).lean();

    if (!exports.length) {
        console.warn("⚠️ Không có dữ liệu xuất kho (wh_exports) trong source");
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

        console.log("📤 WH export ->", msg.export_id, msg.product_id);
    }

    console.log("✅ All warehouse exports sent from source Mongo!");

    setTimeout(() => process.exit(0), 500);
}

main().catch((err) => {
    console.error("❌ Error in producer_wh_export:", err);
    process.exit(1);
});
