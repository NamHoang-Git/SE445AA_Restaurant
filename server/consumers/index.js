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

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function writeConsumerLog(queue, msg) {
    const logLine = `[${new Date().toISOString()}] [${queue}] ${msg}\n`;
    fs.appendFileSync(path.join(LOG_DIR, "consumer.log"), logLine, "utf8");
}

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
    { name: "staging_wh_import", model: StagingWhImport, validate: validateWhImport },
    { name: "staging_wh_export", model: StagingWhExport, validate: validateWhExport },
];

// Helper function to get unique key field for each queue
function getUniqueKey(queueName) {
    const keyMap = {
        'staging_user': 'customer_id',
        'staging_product': 'product_id',
        'staging_order': 'order_id',
        'staging_wh_import': 'import_id',
        'staging_wh_export': 'export_id',
    };
    return keyMap[queueName] || '_id';
}

async function consumeQueue(channel, { name, model, validate }) {
    await channel.assertQueue(name, { durable: true });
    await channel.assertQueue(`error_${name}`, { durable: true });

    console.log(`👂 Listening on ${name}`);
    writeConsumerLog(name, "Started listening");

    channel.consume(
        name,
        async (msg) => {
            if (!msg) return;

            const raw = msg.content.toString();
            console.log("📩 RECEIVED FROM", name, "RAW =", raw);
            writeConsumerLog(name, `RECEIVED: ${raw}`);

            try {
                const payload = JSON.parse(raw);

                const { ok, errors, data } = validate(payload);

                if (!ok) {
                    const errMsg = `VALIDATION FAILED: ${errors.join("; ")}`;
                    console.warn(`⚠️  ${name} ${errMsg}`);
                    writeConsumerLog(name, errMsg);

                    // Enhanced error staging
                    await StagingError.create({
                        source: name,
                        raw_data: payload,
                        cleaned_data: data,  // Include cleaned data even if validation failed
                        validation_errors: errors,
                        error_type: 'VALIDATION_FAILED',
                    });

                    channel.sendToQueue(
                        `error_${name}`,
                        Buffer.from(JSON.stringify({ payload, errors })),
                        { persistent: true }
                    );

                    channel.ack(msg);
                    return;
                }

                // Implement deduplication using upsert
                const uniqueKey = getUniqueKey(name);
                const uniqueValue = data[uniqueKey];

                if (!uniqueValue) {
                    console.warn(`⚠️  ${name}: Missing unique key ${uniqueKey}`);
                    writeConsumerLog(name, `WARN: Missing unique key ${uniqueKey}`);
                    channel.ack(msg);
                    return;
                }

                // Upsert to avoid duplicates
                const result = await model.updateOne(
                    { [uniqueKey]: uniqueValue },
                    { $set: data },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    console.log(`✅ ${name}: inserted (new)`);
                    writeConsumerLog(name, `INSERTED: ${JSON.stringify(data)}`);
                } else {
                    console.log(`🔄 ${name}: updated (deduplicated)`);
                    writeConsumerLog(name, `UPDATED (deduplicated): ${JSON.stringify(data)}`);
                }

                channel.ack(msg);
            } catch (err) {
                console.error(`❌ Error processing message from ${name}:`, err);
                writeConsumerLog(name, `ERROR: ${err.message}`);
                channel.nack(msg, false, false); // tránh loop vô hạn
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
        writeConsumerLog("SYSTEM", `CRASH: ${err.message}`);
        process.exit(1);
    }
}

start();
