// scripts/run_full_etl.js - Run complete ETL pipeline
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to run a script and wait for completion
function runScript(scriptPath, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 ${description}...`);
        console.log(`   Running: ${scriptPath}`);

        const child = spawn('node', [scriptPath], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ ${description} failed with code ${code}`);
                reject(new Error(`${description} failed`));
            } else {
                console.log(`✅ ${description} completed`);
                resolve();
            }
        });

        child.on('error', (err) => {
            console.error(`❌ Error running ${description}:`, err);
            reject(err);
        });
    });
}

// Helper to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   SE445AA Restaurant - Full ETL Pipeline Runner       ║');
    console.log('╚════════════════════════════════════════════════════════╝');

    const startTime = Date.now();

    try {
        // Step 1: Run producers
        console.log('\n📊 STEP 1: Extract data from sources');
        console.log('─'.repeat(60));

        await runScript('producer_user_cs445k.js', 'Extract users from CS445K');
        await wait(1000); // Wait for RabbitMQ to process

        await runScript('producer_product_cs445k.js', 'Extract products from CS445K');
        await wait(1000);

        await runScript('producer_order_cs445k.js', 'Extract orders from CS445K');
        await wait(1000);

        await runScript('producer_wh_import.js', 'Extract warehouse imports');
        await wait(1000);

        // Step 2: Wait for consumer to process
        console.log('\n⏳ STEP 2: Waiting for consumer to process messages...');
        console.log('─'.repeat(60));
        console.log('   (Make sure consumer is running in another terminal)');
        await wait(3000); // Wait 3 seconds for consumer to process

        // Step 3: Transform & Load
        console.log('\n🔄 STEP 3: Transform & Load to Data Warehouse');
        console.log('─'.repeat(60));

        await runScript('scripts/transform_load.js', 'Transform & Load to DW');

        // Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║              ETL Pipeline Completed! 🎉                ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n⏱️  Total time: ${duration}s`);
        console.log('\n📊 Next steps:');
        console.log('   1. Check staging collections: staging_users, staging_products, staging_order_items');
        console.log('   2. Check DW collections: dim_customer, dim_menu_item, fact_order_item');
        console.log('   3. View logs at: http://localhost:5173/admin/reports');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ ETL Pipeline failed:', err.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure MongoDB is running');
        console.log('   2. Make sure RabbitMQ is running');
        console.log('   3. Make sure consumer is running: node consumers/index.js');
        console.log('   4. Check .env file has correct connection strings');

        process.exit(1);
    }
}

main();
