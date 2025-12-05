// scripts/migrate_warehouse_data.js - Migrate existing staging data to warehouse collection
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import StagingWhImport from '../models/staging/stagingWhImport.model.js';
import WhImport from '../models/warehouse/whImport.model.js';

async function migrateWarehouseData() {
    try {
        await connectDB();
        console.log('🔄 Migrating warehouse data from staging to warehouse collection...\n');

        // Get all staging warehouse imports
        const stagingData = await StagingWhImport.find({}).lean();
        console.log(`📦 Found ${stagingData.length} records in staging_wh_imports`);

        if (stagingData.length === 0) {
            console.log('ℹ️  No data to migrate');
            process.exit(0);
        }

        // Clear existing warehouse data
        await WhImport.deleteMany({});
        console.log('🗑️  Cleared existing warehouse_imports collection');

        // Migrate data
        const migratedData = stagingData.map(item => ({
            import_id: item.import_id,
            product_id: item.product_id,
            product_name_raw: item.product_name_raw,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost,
            import_date: item.import_date || new Date(),
            supplier: item.supplier || '',
            warehouse_location: item.warehouse_location || 'WH-MAIN',
            notes: '',
            status: 'completed'
        }));

        const result = await WhImport.insertMany(migratedData);
        console.log(`✅ Migrated ${result.length} records to warehouse_imports\n`);

        // Display migrated data
        console.log('Migrated records:');
        result.forEach((item, i) => {
            console.log(`${i + 1}. ${item.product_name_raw}`);
            console.log(`   Product ID: ${item.product_id}`);
            console.log(`   Quantity: ${item.quantity}`);
            console.log(`   Unit Cost: ${item.unit_cost.toLocaleString()} VND`);
            console.log(`   Total: ${item.total_cost.toLocaleString()} VND\n`);
        });

        console.log('✅ Migration complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Access warehouse UI: http://localhost:5173/admin/warehouse');
        console.log('2. You can now add/edit/delete warehouse imports via UI');
        console.log('3. Run ETL to use the new data: run_etl_v2.bat');

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration error:', err);
        process.exit(1);
    }
}

migrateWarehouseData();
