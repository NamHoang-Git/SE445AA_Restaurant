// analytics/debug_dw.js - Debug DW data
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import mongoose from 'mongoose';

async function debug() {
    try {
        await connectDB();
        console.log('✅ Connected to DB\n');

        const db = mongoose.connection.db;

        // List all collections
        console.log('📋 All Collections:');
        const collections = await db.listCollections().toArray();
        collections.forEach(c => console.log(`   - ${c.name}`));
        console.log('\n');

        // Check DW collections
        console.log('📊 DW Collections Data Count:');

        const dwCollections = [
            'dw_dim_customers',
            'dw_dim_menu_items',
            'dw_fact_order_items',
            'dim_customers',
            'dim_menu_items',
            'fact_order_items'
        ];

        for (const collName of dwCollections) {
            try {
                const count = await db.collection(collName).countDocuments();
                if (count > 0) {
                    console.log(`   ✅ ${collName}: ${count} documents`);

                    // Show sample
                    const sample = await db.collection(collName).findOne();
                    console.log(`      Sample fields: ${Object.keys(sample).join(', ')}`);
                }
            } catch (err) {
                // Collection doesn't exist
            }
        }

        console.log('\n');

        // Check staging
        console.log('📦 Staging Collections:');
        const stagingCount = await db.collection('staging_order_items').countDocuments();
        console.log(`   staging_order_items: ${stagingCount}`);

        const whCount = await db.collection('staging_wh_imports').countDocuments();
        console.log(`   staging_wh_imports: ${whCount}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

debug();
