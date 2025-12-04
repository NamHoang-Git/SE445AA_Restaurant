// analytics/test_simple.js - Simple direct query test
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

async function test() {
    try {
        await connectDB();
        console.log('✅ Connected\n');

        // Test 1: Check menu items with cost
        console.log('1. Menu items with warehouse cost:');
        const itemsWithCost = await DimMenuItem.find({
            avg_import_cost: { $ne: null, $gt: 0 }
        });
        console.log(`   Found: ${itemsWithCost.length} items`);

        if (itemsWithCost.length > 0) {
            const sample = itemsWithCost[0];
            console.log(`   Sample: ${sample.name}`);
            console.log(`   Price: ${sample.price}, Cost: ${sample.avg_import_cost}`);
            console.log(`   Margin: ${((sample.price - sample.avg_import_cost) / sample.price * 100).toFixed(2)}%`);
        }
        console.log('\n');

        // Test 2: Check orders
        console.log('2. Total orders:');
        const orderCount = await FactOrderItem.countDocuments();
        console.log(`   Found: ${orderCount} orders\n`);

        // Test 3: Manual aggregation
        console.log('3. Testing aggregation:');
        const result = await FactOrderItem.aggregate([
            { $limit: 1 },
            {
                $lookup: {
                    from: 'dw_dim_menu_items',
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'product_info'
                }
            },
            { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } }
        ]);

        if (result.length > 0) {
            console.log(`   ✅ Lookup works!`);
            console.log(`   Order: ${result[0].order_id}`);
            console.log(`   Product: ${result[0].product_info?.name || 'NOT FOUND'}`);
            console.log(`   Has cost: ${result[0].product_info?.avg_import_cost ? 'YES' : 'NO'}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

test();
