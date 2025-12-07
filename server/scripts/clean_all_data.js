import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import connectCS445KDB from '../config/connectCS445KDB.js';

// Staging models
import StagingUser from '../models/staging/stagingUser.model.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import StagingOrderItem from '../models/staging/stagingOrderItem.model.js';
import StagingWhImport from '../models/staging/stagingWhImport.model.js';
import StagingError from '../models/staging/stagingError.model.js';

// Data Warehouse models
import DimCustomer from '../models/dw/dimCustomer.model.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

// ETL metadata
import EtlMetadata from '../models/etl_metadata.model.js';

// Warehouse source
import WarehouseImport from '../models/warehouse-source/whImport.source.model.js';

async function cleanAllData() {
    try {
        console.log('🧹 Starting data cleanup...\n');

        // Connect to databases
        await connectDB();
        await connectCS445KDB();

        // 1. Clean Staging Collections
        console.log('📦 Cleaning Staging Collections...');
        await StagingUser.deleteMany({});
        console.log('  ✅ staging_users cleared');

        await StagingProduct.deleteMany({});
        console.log('  ✅ staging_products cleared');

        await StagingOrderItem.deleteMany({});
        console.log('  ✅ staging_order_items cleared');

        await StagingWhImport.deleteMany({});
        console.log('  ✅ staging_wh_imports cleared');

        await StagingError.deleteMany({});
        console.log('  ✅ staging_errors cleared');

        // 2. Clean Data Warehouse
        console.log('\n🏢 Cleaning Data Warehouse...');
        await DimCustomer.deleteMany({});
        console.log('  ✅ dim_customers cleared');

        await DimMenuItem.deleteMany({});
        console.log('  ✅ dim_menu_items cleared');

        await FactOrderItem.deleteMany({});
        console.log('  ✅ fact_order_items cleared');

        // 3. Clean ETL Metadata
        console.log('\n📊 Cleaning ETL Metadata...');
        await EtlMetadata.deleteMany({});
        console.log('  ✅ etl_metadata cleared');

        // 4. Clean Warehouse Imports (Optional - comment out if you want to keep)
        console.log('\n📦 Cleaning Warehouse Imports...');
        await WarehouseImport.deleteMany({});
        console.log('  ✅ warehouse_imports cleared');

        console.log('\n════════════════════════════════════════');
        console.log('🎉 All data cleaned successfully!');
        console.log('════════════════════════════════════════');
        console.log('\n📝 Next steps:');
        console.log('1. Add new products/customers in CS445K database');
        console.log('2. Add warehouse imports via UI');
        console.log('3. Run ETL: run_etl_v2.bat');
        console.log('4. Check analytics dashboard\n');

        process.exit(0);

    } catch (err) {
        console.error('❌ Error cleaning data:', err);
        process.exit(1);
    }
}

cleanAllData();
