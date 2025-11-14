// consumers/index.js
import "dotenv/config";
import connectDB from "../config/connectDB.js";
import { connectRabbitMQ } from "../config/rabbitmq.js";

import StagingUser from "../models/staging/stagingUser.model.js";
import StagingProduct from "../models/staging/stagingProduct.model.js";
import StagingOrderItem from "../models/staging/stagingOrderItem.model.js";
import StagingWhImport from "../models/staging/stagingWhImport.model.js";
import StagingWhExport from "../models/staging/stagingWhExport.model.js";
import StagingError from "../models/staging/stagingError.model.js";

import {
    validateUser,
    validateProduct,
    validateOrderItem,
    validateWhImport,
    validateWhExport,
} from "../utils/validation.js";

const QUEUES = [
    { name: "staging_user", model: StagingUser, validate: validateUser },
    { name: "staging_product", model: StagingProduct, validate: validateProduct },
    { name: "staging_order", model: StagingOrderItem, validate: validateOrderItem },

    // --- Kho ---
    { name: "staging_wh_import", model: StagingWhImport, validate: validateWhImport },
    { name: "staging_wh_export", model: StagingWhExport, validate: validateWhExport },
];

async function consumeQueue(channel, { name, model, validate }) {
    await channel.assertQueue(name, { durable: true });
    await channel.assertQueue(`error_${name}`, { durable: true });

    console.log(`👂 Listening on ${name}`);

    channel.consume(
        name,
        async (msg) => {
            if (!msg) return;

            console.log('📩 RECEIVED FROM', name, 'RAW =', msg.content.toString());

            try {
                const raw = msg.content.toString();
                const payload = JSON.parse(raw);

                const { ok, errors, data } = validate(payload);

                if (!ok) {
                    console.warn(`⚠️  ${name} validation failed:`, errors.join("; "));

                    await StagingError.create({
                        queue: name,
                        original: payload,
                        errors,
                    });

                    // gửi sang queue lỗi
                    channel.sendToQueue(
                        `error_${name}`,
                        Buffer.from(JSON.stringify({ payload, errors })),
                        { persistent: true }
                    );

                    channel.ack(msg);
                    return;
                }

                await model.create(data);
                console.log(`✅ ${name}: saved`);

                channel.ack(msg);
            } catch (err) {
                console.error(`❌ Error processing message from ${name}:`, err);
                // tránh loop vô tận: n reject message
                channel.nack(msg, false, false);
            }
        },
        { noAck: false }
    );
}

async function start() {
    try {
        await connectDB();
        const channel = await connectRabbitMQ();

        await channel.prefetch(10);
        console.log("⚙️  Channel prefetch = 10");

        for (const q of QUEUES) {
            await consumeQueue(channel, q);
        }
    } catch (err) {
        console.error("🚨 Consumer crashed on start:", err);
        process.exit(1);
    }
}

start();
