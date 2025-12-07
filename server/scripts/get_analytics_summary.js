// scripts/get_analytics_summary.js - Get all analytics data for report
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import DimCustomer from '../models/dw/dimCustomer.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

async function getAnalyticsSummary() {
    try {
        await connectDB();
        console.log('📊 Generating Analytics Summary for Report...\n');

        // 1. Profit Analysis
        console.log('═'.repeat(60));
        console.log('1. PROFIT ANALYSIS');
        console.log('═'.repeat(60));

        const productsWithCost = await DimMenuItem.find({
            avg_import_cost: { $ne: null, $gt: 0 },
            price: { $gt: 0 }
        }).lean();

        console.log(`Products with cost data: ${productsWithCost.length}\n`);

        // Calculate profit for each product
        const profitData = [];
        for (const product of productsWithCost) {
            const sales = await FactOrderItem.aggregate([
                { $match: { product_id: product.product_id } },
                {
                    $group: {
                        _id: null,
                        total_quantity: { $sum: '$quantity' },
                        total_revenue: { $sum: '$total' }
                    }
                }
            ]);

            const quantity = sales[0]?.total_quantity || 0;
            const revenue = sales[0]?.total_revenue || 0;
            const cost = product.avg_import_cost * quantity;
            const profit = revenue - cost;
            const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;

            profitData.push({
                name: product.name,
                price: product.price,
                cost: product.avg_import_cost,
                quantity_sold: quantity,
                revenue: revenue,
                total_cost: cost,
                profit: profit,
                margin_percent: margin
            });
        }

        // Sort by margin
        profitData.sort((a, b) => b.margin_percent - a.margin_percent);

        console.log('Top 5 Products by Profit Margin:');
        profitData.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Price: ${p.price.toLocaleString()} VND | Cost: ${p.cost.toLocaleString()} VND`);
            console.log(`   Margin: ${p.margin_percent.toFixed(2)}%`);
            console.log(`   Sold: ${p.quantity_sold} units | Revenue: ${p.revenue.toLocaleString()} VND\n`);
        });

        // Overall summary
        const totalRevenue = profitData.reduce((sum, p) => sum + p.revenue, 0);
        const totalCost = profitData.reduce((sum, p) => sum + p.total_cost, 0);
        const totalProfit = totalRevenue - totalCost;
        const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

        console.log('\nOverall Summary:');
        console.log(`Total Revenue: ${totalRevenue.toLocaleString()} VND`);
        console.log(`Total Cost: ${totalCost.toLocaleString()} VND`);
        console.log(`Total Profit: ${totalProfit.toLocaleString()} VND`);
        console.log(`Overall Margin: ${overallMargin.toFixed(2)}%\n`);

        // 2. Customer Analytics
        console.log('═'.repeat(60));
        console.log('2. CUSTOMER ANALYTICS');
        console.log('═'.repeat(60));

        const customerStats = await FactOrderItem.aggregate([
            {
                $group: {
                    _id: '$customer_id',
                    total_orders: { $sum: 1 },
                    total_revenue: { $sum: '$total' }
                }
            },
            {
                $lookup: {
                    from: 'dw_dim_customers',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            { $sort: { total_revenue: -1 } },
            { $limit: 5 }
        ]);

        console.log('\nTop 5 Customers by Revenue:');
        customerStats.forEach((c, i) => {
            console.log(`${i + 1}. ${c.customer.name}`);
            console.log(`   Orders: ${c.total_orders} | Revenue: ${c.total_revenue.toLocaleString()} VND\n`);
        });

        // Customer segmentation
        const allCustomers = await DimCustomer.find({}).lean();
        const segments = { GOLD: 0, SILVER: 0, BRONZE: 0 };
        allCustomers.forEach(c => {
            if (c.customer_tier) segments[c.customer_tier]++;
        });

        console.log('Customer Segmentation:');
        console.log(`GOLD: ${segments.GOLD} customers`);
        console.log(`SILVER: ${segments.SILVER} customers`);
        console.log(`BRONZE: ${segments.BRONZE} customers\n`);

        // 3. Product Performance
        console.log('═'.repeat(60));
        console.log('3. PRODUCT PERFORMANCE');
        console.log('═'.repeat(60));

        const productPerformance = await FactOrderItem.aggregate([
            {
                $group: {
                    _id: '$product_id',
                    total_quantity: { $sum: '$quantity' },
                    total_revenue: { $sum: '$total' },
                    order_count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'dw_dim_menu_items',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $sort: { total_quantity: -1 } },
            { $limit: 5 }
        ]);

        console.log('\nTop 5 Best Sellers (by quantity):');
        productPerformance.forEach((p, i) => {
            console.log(`${i + 1}. ${p.product.name}`);
            console.log(`   Units Sold: ${p.total_quantity} | Revenue: ${p.total_revenue.toLocaleString()} VND\n`);
        });

        console.log('═'.repeat(60));
        console.log('✅ Analytics Summary Complete!');
        console.log('═'.repeat(60));

        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

getAnalyticsSummary();
