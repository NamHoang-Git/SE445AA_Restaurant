// scripts/check_new_product.js - Check if new product is in DW
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';

async function checkNewProduct() {
    try {
        await connectDB();
        console.log('✅ Connected to DB\n');

        // Get total count
        const total = await DimMenuItem.countDocuments();
        console.log(`📊 Total products in DW: ${total}\n`);

        // Get latest products
        const latest = await DimMenuItem.find({})
            .sort({ _id: -1 })
            .limit(3);

        console.log('🆕 Latest 3 products in Data Warehouse:\n');
        latest.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Product ID: ${p.product_id}`);
            console.log(`   Price: ${p.price?.toLocaleString() || 'N/A'} VND`);
            console.log(`   Cost: ${p.avg_import_cost?.toLocaleString() || 'N/A'} VND`);
            console.log(`   Created: ${p.createdAt}\n`);
        });

        // Check if we have 10 products (9 old + 1 new)
        if (total === 10) {
            console.log('✅ New product detected! (Total: 10, was 9)');
        } else if (total === 9) {
            console.log('⚠️  Still 9 products. New product might not be in DW yet.');
            console.log('   Check staging_products or run ETL again.');
        } else {
            console.log(`ℹ️  Total products: ${total}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkNewProduct();
