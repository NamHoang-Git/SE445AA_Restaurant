// analytics/test_customer.js - Quick test
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import { getTopCustomersByRevenue, getCustomerSegmentationByTier } from './customer_analytics.js';

async function test() {
    try {
        await connectDB();
        console.log('✅ Connected\n');

        console.log('1. Top 5 Customers:');
        const topCustomers = await getTopCustomersByRevenue(5);
        topCustomers.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.customer_name || 'Unknown'}: ${c.total_revenue.toLocaleString()} VND (${c.total_orders} orders)`);
        });
        console.log('\n');

        console.log('2. Customer Segmentation:');
        const segmentation = await getCustomerSegmentationByTier();
        segmentation.forEach(seg => {
            console.log(`   ${seg.tier || 'Unknown'}: ${seg.customer_count} customers, ${seg.total_revenue.toLocaleString()} VND`);
        });

        console.log('\n✅ Test complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

test();
