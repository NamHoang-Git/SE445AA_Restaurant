// producer_user_cs445k_v2.js - Enhanced with incremental load
import 'dotenv/config';
import amqp from 'amqplib';
import CS445KUser from './models/cs445k-source/user.source.model.js';
import { getLastRunTimestamp, updateEtlMetadata, markEtlRunning } from './utils/etl_helper.js';
import connectDB from './config/connectDB.js';
import { cleanUserData } from './utils/dataCleaning.util.js';

const QUEUE_NAME = 'staging_users';
const SOURCE_NAME = 'users';

async function produceUsers(runType = 'full') {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsFailed = 0;

    try {
        // Connect to main DB for metadata
        await connectDB();

        // Mark as running
        await markEtlRunning(SOURCE_NAME);

        // Get last run timestamp for incremental
        let query = {};
        if (runType === 'incremental') {
            const lastRun = await getLastRunTimestamp(SOURCE_NAME);
            if (lastRun) {
                query = { updatedAt: { $gt: lastRun } };
                console.log(`📅 Incremental load: fetching users updated after ${lastRun}`);
            } else {
                console.log('⚠️  No previous run found, falling back to full load');
                runType = 'full';
            }
        }

        if (runType === 'full') {
            console.log('🔄 Full load: fetching all users');
        }

        // Fetch users
        const users = await CS445KUser.find(query).lean();
        console.log(`✅ Found ${users.length} users to process`);

        if (users.length === 0) {
            console.log('ℹ️  No new users to process');
            await updateEtlMetadata(SOURCE_NAME, {
                status: 'success',
                recordsProcessed: 0,
                recordsFailed: 0,
                runType,
                durationMs: Date.now() - startTime
            });
            return;
        }

        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Publish users
        for (const user of users) {
            try {
                // Clean user data BEFORE sending to queue
                const cleaned = cleanUserData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.mobile || user.phone || ''
                });

                const message = {
                    customer_id: user._id.toString(),
                    name: cleaned.name,
                    email: cleaned.email,
                    phone: cleaned.phone,
                    tier: user.role || 'BRONZE',
                    status: user.status || 'active',
                    created_at: user.createdAt || new Date()
                };

                channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
                    persistent: true
                });
                recordsProcessed++;
            } catch (err) {
                console.error(`Error processing user ${user._id}:`, err.message);
                recordsFailed++;
            }
        }

        await channel.close();
        await connection.close();

        // Update metadata
        const durationMs = Date.now() - startTime;
        await updateEtlMetadata(SOURCE_NAME, {
            status: 'success',
            recordsProcessed,
            recordsFailed,
            runType,
            durationMs
        });

        console.log(`✅ Published ${recordsProcessed} users to queue`);
        console.log(`⏱️  Duration: ${durationMs}ms`);
        if (recordsFailed > 0) {
            console.log(`⚠️  Failed: ${recordsFailed} users`);
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

// Parse command line args
const args = process.argv.slice(2);
const runType = args.includes('--incremental') ? 'incremental' : 'full';

produceUsers(runType)
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
