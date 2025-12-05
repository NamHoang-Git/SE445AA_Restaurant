// producer_wh_import_v2.js - Enhanced with incremental load
import 'dotenv/config';
import amqp from 'amqplib';
import connectDB from './config/connectDB.js';
import WhImport from './models/warehouse/whImport.model.js';
import { getLastRunTimestamp, updateEtlMetadata, markEtlRunning } from './utils/etl_helper.js';

const QUEUE_NAME = 'staging_wh_imports';
const SOURCE_NAME = 'wh_imports';

async function produceWhImports(runType = 'full') {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsFailed = 0;

    try {
        await connectDB();
        await markEtlRunning(SOURCE_NAME);

        let query = {};
        if (runType === 'incremental') {
            const lastRun = await getLastRunTimestamp(SOURCE_NAME);
            if (lastRun) {
                query = { updatedAt: { $gt: lastRun } };
                console.log(`📅 Incremental load: fetching warehouse imports updated after ${lastRun}`);
            } else {
                console.log('⚠️  No previous run found, falling back to full load');
                runType = 'full';
            }
        }

        if (runType === 'full') {
            console.log('🔄 Full load: fetching all warehouse imports');
        }

        // Read from warehouse_imports collection (not staging!)
        const whImports = await WhImport.find(query).lean();
        console.log(`✅ Found ${whImports.length} warehouse imports to process`);

        if (whImports.length === 0) {
            console.log('ℹ️  No new warehouse imports to process');
            await updateEtlMetadata(SOURCE_NAME, {
                status: 'success',
                recordsProcessed: 0,
                recordsFailed: 0,
                runType,
                durationMs: Date.now() - startTime
            });
            return;
        }

        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        for (const wh of whImports) {
            try {
                const message = {
                    import_id: wh.import_id,
                    product_id: wh.product_id,
                    product_name_raw: wh.product_name_raw || '',
                    quantity: wh.quantity || 0,
                    unit_cost: wh.unit_cost || 0,
                    import_date: wh.import_date || new Date(),
                    supplier: wh.supplier || '',
                    warehouse_location: wh.warehouse_location || ''
                };

                channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                    persistent: true
                });
                recordsProcessed++;
            } catch (err) {
                console.error(`Error processing warehouse import ${wh.import_id}:`, err.message);
                recordsFailed++;
            }
        }

        await channel.close();
        await connection.close();

        const durationMs = Date.now() - startTime;
        await updateEtlMetadata(SOURCE_NAME, {
            status: 'success',
            recordsProcessed,
            recordsFailed,
            runType,
            durationMs
        });

        console.log(`✅ Published ${recordsProcessed} warehouse imports to queue`);
        console.log(`⏱️  Duration: ${durationMs}ms`);
        if (recordsFailed > 0) {
            console.log(`⚠️  Failed: ${recordsFailed} imports`);
        }

    } catch (err) {
        console.error('❌ Error in producer:', err);
        await updateEtlMetadata(SOURCE_NAME, {
            status: 'failed',
            recordsProcessed,
            recordsFailed,
            runType,
            durationMs: Date.now() - startTime
        });
        throw err;
    }
}

const args = process.argv.slice(2);
const runType = args.includes('--incremental') ? 'incremental' : 'full';

produceWhImports(runType)
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
