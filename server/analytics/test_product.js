// analytics/test_product.js
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import { getBestSellingProducts, getProductsByRevenue } from './product_analytics.js';

async function test() {
    try {
        await connectDB();
        console.log('✅ Connected\n');

        console.log('1. Top 5 Best Sellers:');
        const bestSellers = await getBestSellingProducts(5);
        bestSellers.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.product_name || 'Unknown'}: ${p.total_quantity} units, ${p.total_revenue.toLocaleString()} VND`);
        });
        console.log('\n');

        console.log('2. Top 5 by Revenue:');
        const byRevenue = await getProductsByRevenue(5);
        byRevenue.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.product_name || 'Unknown'}: ${p.total_revenue.toLocaleString()} VND`);
        });

        console.log('\n✅ Test complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

test();
