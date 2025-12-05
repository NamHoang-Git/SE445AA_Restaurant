// scripts/run_etl_incremental.js - ETL with incremental support
import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const runType = args.includes('--incremental') ? '--incremental' : '--full';

console.log(`🚀 Starting ETL Pipeline (${runType === '--incremental' ? 'INCREMENTAL' : 'FULL'} mode)...\n`);

const startTime = Date.now();

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const proc = spawn('node', [command, ...args], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            shell: true
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on('error', reject);
    });
}

async function runETL() {
    try {
        // Step 1: Run producers
        console.log('📤 Step 1: Running Producers...\n');

        const producers = [
            'producer_user_cs445k_v2.js',
            'producer_product_cs445k_v2.js',
            'producer_order_cs445k_v2.js',
            'producer_wh_import_v2.js'
        ];

        for (const producer of producers) {
            console.log(`   Running ${producer}...`);
            await runCommand(producer, runType === '--incremental' ? ['--incremental'] : []);
        }

        console.log('\n✅ All producers completed\n');

        // Step 2: Wait for consumer processing
        console.log('⏳ Step 2: Waiting for consumer processing (10 seconds)...\n');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Step 3: Transform & Load
        console.log('🔄 Step 3: Running Transform & Load...\n');
        await runCommand('scripts/transform_load.js');

        console.log('\n✅ Transform & Load completed\n');

        // Done
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('═'.repeat(60));
        console.log(`🎉 ETL Pipeline Complete! (${runType === '--incremental' ? 'Incremental' : 'Full'} mode)`);
        console.log(`⏱️  Total Duration: ${duration} seconds`);
        console.log('═'.repeat(60));

        process.exit(0);
    } catch (err) {
        console.error('\n❌ ETL Pipeline Failed:', err.message);
        process.exit(1);
    }
}

runETL();
