// scripts/check_etl_metadata.js - Check if metadata is being saved
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import EtlMetadata from '../models/etl_metadata.model.js';

async function checkMetadata() {
    try {
        await connectDB();
        console.log('✅ Connected to DB\n');

        // Check existing metadata
        const metadata = await EtlMetadata.find({});
        console.log(`📊 Found ${metadata.length} metadata records:\n`);

        if (metadata.length === 0) {
            console.log('⚠️  No metadata found! This is why incremental always falls back to full.\n');
            console.log('Creating test metadata...');

            // Create test metadata
            await EtlMetadata.create({
                source: 'users',
                last_run_at: new Date(),
                last_run_status: 'success',
                records_processed: 16,
                records_failed: 0,
                run_type: 'full',
                run_duration_ms: 1500
            });

            console.log('✅ Test metadata created!\n');
            console.log('Now run: run_etl_v2.bat --incremental');
            console.log('It should use incremental mode for users!\n');
        } else {
            metadata.forEach((m, i) => {
                console.log(`${i + 1}. Source: ${m.source}`);
                console.log(`   Last Run: ${m.last_run_at}`);
                console.log(`   Status: ${m.last_run_status}`);
                console.log(`   Type: ${m.run_type}`);
                console.log(`   Records: ${m.records_processed}`);
                console.log(`   Duration: ${m.run_duration_ms}ms\n`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkMetadata();
