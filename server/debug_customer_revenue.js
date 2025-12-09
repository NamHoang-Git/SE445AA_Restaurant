// Debug script to check why totalRevenue is 0
import 'dotenv/config';
import connectDB from './config/connectDB.js';
import mongoose from 'mongoose';

async function debugCustomerRevenue() {
    try {
        await connectDB();
        const db = mongoose.connection.db;

        console.log('🔍 Debugging Customer Revenue...\n');

        // 1. Check total order items
        const totalItems = await db.collection('dw_fact_order_items').countDocuments();
        console.log(`📊 Total order items: ${totalItems}`);

        // 2. Sample order items
        const sampleItems = await db.collection('dw_fact_order_items')
            .find({})
            .limit(5)
            .toArray();

        console.log('\n📦 Sample order items:');
        sampleItems.forEach((item, i) => {
            console.log(`  ${i + 1}. Customer: ${item.customer_id}`);
            console.log(`     Product: ${item.product_id}`);
            console.log(`     Quantity: ${item.quantity}`);
            console.log(`     Price: ${item.price}`);
            console.log(`     Revenue: ${item.quantity * item.price}`);
            console.log('');
        });

        // 3. Check price distribution
        const priceStats = await db.collection('dw_fact_order_items')
            .aggregate([
                {
                    $group: {
                        _id: null,
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                        nullPriceCount: {
                            $sum: {
                                $cond: [{ $eq: ['$price', null] }, 1, 0]
                            }
                        },
                        zeroPriceCount: {
                            $sum: {
                                $cond: [{ $eq: ['$price', 0] }, 1, 0]
                            }
                        }
                    }
                }
            ])
            .toArray();

        console.log('💰 Price Statistics:');
        if (priceStats[0]) {
            console.log(`  Average: ${priceStats[0].avgPrice}`);
            console.log(`  Min: ${priceStats[0].minPrice}`);
            console.log(`  Max: ${priceStats[0].maxPrice}`);
            console.log(`  Null prices: ${priceStats[0].nullPriceCount}`);
            console.log(`  Zero prices: ${priceStats[0].zeroPriceCount}`);
        }

        // 4. Top customers calculation
        console.log('\n👥 Top Customers by Revenue:');
        const topCustomers = await db.collection('dw_fact_order_items')
            .aggregate([
                {
                    $group: {
                        _id: '$customer_id',
                        totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } },
                        orderCount: { $sum: 1 },
                        totalQuantity: { $sum: '$quantity' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 }
            ])
            .toArray();

        topCustomers.forEach((c, i) => {
            console.log(`  ${i + 1}. Customer ID: ${c._id}`);
            console.log(`     Orders: ${c.orderCount}`);
            console.log(`     Total Quantity: ${c.totalQuantity}`);
            console.log(`     Total Revenue: ${c.totalRevenue}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugCustomerRevenue();
