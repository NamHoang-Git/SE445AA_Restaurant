// scripts/debug_new_product.js - Debug where new product is
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';

async function debugNewProduct() {
    try {
        await connectDB();
        console.log('✅ Connected to DB\n');

        // Check staging
        const stagingCount = await StagingProduct.countDocuments();
        console.log(`📦 Staging Products: ${stagingCount}`);

        if (stagingCount > 0) {
            const stagingProducts = await StagingProduct.find({})
                .sort({ createdAt: -1 })
                .limit(3);

            console.log('\n🔍 Latest in Staging:\n');
            stagingProducts.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
                console.log(`   ID: ${p.product_id}`);
                console.log(`   Created: ${p.createdAt}\n`);
            });
        }

        // Check DW
        const dwCount = await DimMenuItem.countDocuments();
        console.log(`\n🏛️  Data Warehouse Products: ${dwCount}`);

        const dwProducts = await DimMenuItem.find({})
            .sort({ createdAt: -1 })
            .limit(3);

        console.log('\n🔍 Latest in DW:\n');
        dwProducts.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   ID: ${p.product_id}`);
            console.log(`   Created: ${p.createdAt}\n`);
        });

        // Analysis
        console.log('═══════════════════════════════════════');
        if (stagingCount > dwCount) {
            console.log('⚠️  Staging has MORE products than DW!');
            console.log('   → Transform might be skipping some products');
            console.log('   → Or consumer hasn\'t processed yet');
        } else if (stagingCount === dwCount) {
            console.log('✅ Staging and DW have same count');
            console.log('   → All staging products transformed to DW');
        } else {
            console.log('ℹ️  DW has more (includes merged data)');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

debugNewProduct();
