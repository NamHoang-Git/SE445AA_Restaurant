// analytics/test_profit.js - Quick test script
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import { getProfitSummary, getHighestMarginProducts } from './profit_analysis.js';

async function test() {
    try {
        await connectDB();
        console.log('✅ Connected to DB\n');

        console.log('📊 Testing Profit Analysis...\n');

        // Test 1: Get summary
        console.log('1. Profit Summary:');
        const summary = await getProfitSummary();
        console.log(JSON.stringify(summary, null, 2));
        console.log('\n');

        // Test 2: Get highest margin products
        console.log('2. Top 3 Highest Margin Products:');
        const topProducts = await getHighestMarginProducts(3);
        topProducts.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name}`);
            console.log(`      Price: ${p.price} | Cost: ${p.avg_import_cost}`);
            console.log(`      Margin: ${p.profit_margin_percent.toFixed(2)}%`);
        });

        console.log('\n✅ Test complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

test();
