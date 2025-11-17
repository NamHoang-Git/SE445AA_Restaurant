// test_wh_producer_simple.js
import "dotenv/config";
import { connectRabbitMQ } from "./config/rabbitmq.js";

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = "staging_wh_import";

    await channel.assertQueue(QUEUE, { durable: true });

    const msg = { test: true, source: "simple" };
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });

    console.log("📤 SIMPLE SENT to", QUEUE, msg);
    setTimeout(() => process.exit(0), 500);
}

main().catch((err) => {
    console.error("Error in simple producer:", err);
    process.exit(1);
});
