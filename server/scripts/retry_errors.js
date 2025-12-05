// scripts/retry_errors.js - Retry failed records
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import StagingError from '../models/staging/stagingError.model.js';
import amqp from 'amqplib';

const MAX_RETRIES = 3;

async function retryErrors(filter = {}) {
    try {
        await connectDB();

        // Get errors that haven't exceeded max retries
        const errors = await StagingError.find({
            ...filter,
            retry_count: { $lt: MAX_RETRIES }
        }).limit(100);

        if (errors.length === 0) {
            console.log('ℹ️  No errors to retry');
            return;
        }

        console.log(`🔄 Found ${errors.length} errors to retry\n`);

        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();

        let successCount = 0;
        let failCount = 0;

        for (const error of errors) {
            try {
                // Determine queue based on source
                let queueName = '';
                if (error.source === 'users') queueName = 'staging_users';
                else if (error.source === 'products') queueName = 'staging_products';
                else if (error.source === 'orders') queueName = 'staging_order_items';
                else if (error.source === 'wh_imports') queueName = 'staging_wh_imports';
                else {
                    console.log(`⚠️  Unknown source: ${error.source}`);
                    continue;
                }

                await channel.assertQueue(queueName, { durable: true });

                // Re-publish raw data
                channel.sendToQueue(
                    queueName,
                    Buffer.from(JSON.stringify(error.raw_data)),
                    { persistent: true }
                );

                // Update retry count
                await StagingError.findByIdAndUpdate(error._id, {
                    $inc: { retry_count: 1 },
                    last_retry_at: new Date()
                });

                successCount++;
                console.log(`✅ Retried: ${error.source} - ${error._id}`);

            } catch (err) {
                failCount++;
                console.error(`❌ Failed to retry ${error._id}:`, err.message);
            }
        }

        await channel.close();
        await connection.close();

        console.log('\n═'.repeat(60));
        console.log(`✅ Retry Complete: ${successCount} succeeded, ${failCount} failed`);
        console.log('═'.repeat(60));

    } catch (err) {
        console.error('❌ Error in retry:', err);
        throw err;
    }
}

// Parse command line args
const args = process.argv.slice(2);
const sourceFilter = args.find(arg => arg.startsWith('--source='));
const filter = sourceFilter ? { source: sourceFilter.split('=')[1] } : {};

retryErrors(filter)
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
