// consumers/index.js
import "dotenv/config";
import connectDB from "../config/connectDB.js";
import { connectRabbitMQ } from "../config/rabbitmq.js";
import connectCS445KDB from "../config/connectCS445KDB.js";

import StagingUser from "../models/staging/stagingUser.model.js";
import StagingProduct from "../models/staging/stagingProduct.model.js";
import StagingOrderItem from "../models/staging/stagingOrderItem.model.js";
import StagingWhImport from "../models/staging/stagingWhImport.model.js";
import StagingWhExport from "../models/staging/stagingWhExport.model.js";
import StagingError from "../models/staging/stagingError.model.js";
import CS445KProduct from "../models/cs445k-source/product.source.model.js";
import WarehouseImport from "../models/warehouse/whImport.model.js";

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
    { name: "staging_users", model: StagingUser, validate: validateUser },
    { name: "staging_products", model: StagingProduct, validate: validateProduct },
    { name: "staging_order_items", model: StagingOrderItem, validate: validateOrderItem },
    { name: "staging_wh_imports", model: StagingWhImport, validate: validateWhImport },
    { name: "staging_wh_exports", model: StagingWhExport, validate: validateWhExport },
];

// Helper function to get unique key field for each queue
function getUniqueKey(queueName) {
    const keyMap = {
        'staging_users': 'customer_id',
        'staging_products': 'product_id',
        'staging_order_items': 'order_id',
        'staging_wh_imports': 'import_id',
        'staging_wh_exports': 'export_id',
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

                // 🔄 AUTO-SYNC PRODUCT NAME FOR WAREHOUSE IMPORTS
                if (name === 'staging_wh_imports' && payload.product_id) {
                    // Validate ObjectId format FIRST (before database query)
                    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(payload.product_id);

                    if (!isValidObjectId) {
                        // ❌ REJECT - Invalid ObjectId format
                        const errorMsg = `Product ID format không hợp lệ (phải là 24 ký tự hex): ${payload.product_id}`;
                        console.error(`❌ ${errorMsg}`);
                        writeConsumerLog(name, `ERROR: ${errorMsg}`);

                        await StagingError.create({
                            source: name,
                            raw_data: payload,
                            cleaned_data: payload,
                            validation_errors: [errorMsg],
                            error_type: 'INVALID_OBJECTID_FORMAT',
                        });

                        channel.sendToQueue(
                            `error_${name}`,
                            Buffer.from(JSON.stringify({ payload, errors: [errorMsg] })),
                            { persistent: true }
                        );

                        // 🗑️ AUTO-DELETE invalid import from source
                        try {
                            await connectDB();
                            const deleted = await WarehouseImport.findOneAndDelete({
                                import_id: payload.import_id
                            });
                            if (deleted) {
                                console.log(`🗑️ Auto-deleted invalid import: ${payload.import_id}`);
                                writeConsumerLog(name, `AUTO_DELETE: ${payload.import_id} (invalid ObjectId format)`);
                            }
                        } catch (delErr) {
                            console.error(`⚠️ Failed to auto-delete invalid import:`, delErr);
                            writeConsumerLog(name, `AUTO_DELETE_FAILED: ${delErr.message}`);
                        }

                        channel.ack(msg);
                        return;
                    }

                    // ObjectId format is valid - check if product exists
                    try {
                        await connectCS445KDB();
                        const product = await CS445KProduct.findById(payload.product_id);

                        if (!product) {
                            // ❌ REJECT - Product not found
                            const errorMsg = `Product ID không tồn tại trong CS445K: ${payload.product_id}`;
                            console.error(`❌ ${errorMsg}`);
                            writeConsumerLog(name, `ERROR: ${errorMsg}`);

                            await StagingError.create({
                                source: name,
                                raw_data: payload,
                                cleaned_data: payload,
                                validation_errors: [errorMsg],
                                error_type: 'INVALID_PRODUCT_ID',
                            });

                            channel.sendToQueue(
                                `error_${name}`,
                                Buffer.from(JSON.stringify({ payload, errors: [errorMsg] })),
                                { persistent: true }
                            );

                            // 🗑️ AUTO-DELETE import with non-existent product
                            try {
                                await connectDB();
                                const deleted = await WarehouseImport.findOneAndDelete({
                                    import_id: payload.import_id
                                });
                                if (deleted) {
                                    console.log(`🗑️ Auto-deleted import with invalid product: ${payload.import_id}`);
                                    writeConsumerLog(name, `AUTO_DELETE: ${payload.import_id} (product not found)`);
                                }
                            } catch (delErr) {
                                console.error(`⚠️ Failed to auto-delete invalid import:`, delErr);
                                writeConsumerLog(name, `AUTO_DELETE_FAILED: ${delErr.message}`);
                            }

                            channel.ack(msg);
                            return;
                        }

                        // Product found - sync name if different
                        const originalName = payload.product_name_raw;
                        const correctName = product.name;

                        if (originalName !== correctName) {
                            console.log(`🔄 Name sync for product ${payload.product_id}:`);
                            console.log(`   User input: "${originalName}"`);
                            console.log(`   CS445K name: "${correctName}"`);
                            console.log(`   → Auto-corrected ✅`);

                            writeConsumerLog(name, `NAME_SYNC: "${originalName}" → "${correctName}"`);

                            payload.product_name_raw = correctName;
                            payload._name_corrected = true;
                            payload._original_name = originalName;
                        }
                    } catch (syncErr) {
                        // Network or DB errors - log but continue
                        console.error(`❌ Error syncing product name:`, syncErr);
                        writeConsumerLog(name, `ERROR_SYNC: ${syncErr.message}`);
                    }
                }

                const { ok, errors, data } = validate(payload);

                if (!ok) {
                    const errMsg = `VALIDATION FAILED: ${errors.join("; ")}`;
                    console.warn(`⚠️  ${name} ${errMsg}`);
                    writeConsumerLog(name, errMsg);

                    await StagingError.create({
                        source: name,
                        raw_data: payload,
                        cleaned_data: data,
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

                // Deduplication using upsert
                const uniqueKey = getUniqueKey(name);
                const uniqueValue = data[uniqueKey];

                if (!uniqueValue) {
                    console.warn(`⚠️  ${name}: Missing unique key ${uniqueKey}`);
                    writeConsumerLog(name, `WARN: Missing unique key ${uniqueKey}`);
                    channel.ack(msg);
                    return;
                }

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
        writeConsumerLog("SYSTEM", `CRASH: ${err.message}`);
        process.exit(1);
    }
}

start();
