// test_wh_consumer.js
import "dotenv/config";
import { connectRabbitMQ } from "./config/rabbitmq.js";

async function main() {
    const channel = await connectRabbitMQ();
    const QUEUE = "staging_wh_import";

    await channel.assertQueue(QUEUE, { durable: true });
    console.log("👂 MINI CONSUMER listening on", QUEUE);

    channel.consume(
        QUEUE,
        (msg) => {
            if (!msg) return;
            console.log("📩 RECEIVED:", msg.content.toString());
            channel.ack(msg);
        },
        { noAck: false }
    );
}

main().catch((err) => {
    console.error("Error in mini consumer:", err);
});
