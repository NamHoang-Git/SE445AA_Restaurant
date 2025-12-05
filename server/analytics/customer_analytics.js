// analytics/customer_analytics.js
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimCustomer from '../models/dw/dimCustomer.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

/**
 * 1. Get top customers by revenue
 */
export async function getTopCustomersByRevenue(limit = 10) {
    const results = await FactOrderItem.aggregate([
        // Group by customer
        {
            $group: {
                _id: '$customer_id',
                total_revenue: { $sum: '$total' },
                total_orders: { $sum: 1 },
                avg_order_value: { $avg: '$total' }
            }
        },

        // Join with customer details
        {
            $lookup: {
                from: 'dw_dim_customers',
                localField: '_id',
                foreignField: 'customer_id',
                as: 'customer_info'
            }
        },
        { $unwind: { path: '$customer_info', preserveNullAndEmptyArrays: true } },

        // Project final fields
        {
            $project: {
                customer_id: '$_id',
                customer_name: '$customer_info.name',
                customer_tier: '$customer_info.tier',
                total_revenue: 1,
                total_orders: 1,
                avg_order_value: 1
            }
        },

        // Sort by revenue
        { $sort: { total_revenue: -1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * 2. Get customer lifetime value (CLV)
 */
export async function getCustomerLifetimeValue() {
    const results = await FactOrderItem.aggregate([
        // Group by customer
        {
            $group: {
                _id: '$customer_id',
                total_spent: { $sum: '$total' },
                order_count: { $sum: 1 },
                first_order: { $min: '$ordered_at' },
                last_order: { $max: '$ordered_at' }
            }
        },

        // Join with customer details
        {
            $lookup: {
                from: 'dw_dim_customers',
                localField: '_id',
                foreignField: 'customer_id',
                as: 'customer_info'
            }
        },
        { $unwind: { path: '$customer_info', preserveNullAndEmptyArrays: true } },

        // Calculate CLV metrics
        {
            $addFields: {
                customer_name: '$customer_info.name',
                customer_tier: '$customer_info.tier',
                customer_since: '$first_order',
                days_active: {
                    $divide: [
                        { $subtract: ['$last_order', '$first_order'] },
                        1000 * 60 * 60 * 24  // Convert ms to days
                    ]
                },
                avg_order_value: { $divide: ['$total_spent', '$order_count'] }
            }
        },

        // Calculate projected lifetime value (simple: current spend * 2)
        {
            $addFields: {
                projected_ltv: { $multiply: ['$total_spent', 2] }
            }
        },

        // Sort by total spent
        { $sort: { total_spent: -1 } }
    ]);

    return results;
}

/**
 * 3. Get customer segmentation by tier
 */
export async function getCustomerSegmentationByTier() {
    const results = await FactOrderItem.aggregate([
        // Join with customer details
        {
            $lookup: {
                from: 'dw_dim_customers',
                localField: 'customer_id',
                foreignField: 'customer_id',
                as: 'customer_info'
            }
        },
        { $unwind: { path: '$customer_info', preserveNullAndEmptyArrays: true } },

        // Group by tier
        {
            $group: {
                _id: '$customer_info.tier',
                customer_count: { $addToSet: '$customer_id' },
                total_revenue: { $sum: '$total' },
                total_orders: { $sum: 1 }
            }
        },

        // Calculate metrics
        {
            $project: {
                tier: '$_id',
                customer_count: { $size: '$customer_count' },
                total_revenue: 1,
                total_orders: 1,
                avg_revenue_per_customer: {
                    $divide: ['$total_revenue', { $size: '$customer_count' }]
                },
                avg_orders_per_customer: {
                    $divide: ['$total_orders', { $size: '$customer_count' }]
                }
            }
        },

        // Sort by revenue
        { $sort: { total_revenue: -1 } }
    ]);

    return results;
}

/**
 * 4. Get customer purchase frequency
 */
export async function getCustomerPurchaseFrequency() {
    const results = await FactOrderItem.aggregate([
        // Group by customer
        {
            $group: {
                _id: '$customer_id',
                order_count: { $sum: 1 },
                first_order: { $min: '$ordered_at' },
                last_order: { $max: '$ordered_at' }
            }
        },

        // Join with customer details
        {
            $lookup: {
                from: 'dw_dim_customers',
                localField: '_id',
                foreignField: 'customer_id',
                as: 'customer_info'
            }
        },
        { $unwind: { path: '$customer_info', preserveNullAndEmptyArrays: true } },

        // Calculate frequency metrics
        {
            $addFields: {
                customer_name: '$customer_info.name',
                customer_tier: '$customer_info.tier',
                days_between_orders: {
                    $cond: {
                        if: { $gt: ['$order_count', 1] },
                        then: {
                            $divide: [
                                { $subtract: ['$last_order', '$first_order'] },
                                {
                                    $multiply: [
                                        { $subtract: ['$order_count', 1] },
                                        1000 * 60 * 60 * 24
                                    ]
                                }
                            ]
                        },
                        else: null
                    }
                }
            }
        },

        // Categorize frequency
        {
            $addFields: {
                frequency_category: {
                    $cond: {
                        if: { $gte: ['$order_count', 10] },
                        then: 'Very Frequent',
                        else: {
                            $cond: {
                                if: { $gte: ['$order_count', 5] },
                                then: 'Frequent',
                                else: {
                                    $cond: {
                                        if: { $gte: ['$order_count', 2] },
                                        then: 'Occasional',
                                        else: 'One-time'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // Sort by order count
        { $sort: { order_count: -1 } }
    ]);

    return results;
}

/**
 * 5. Get customer retention analysis
 */
export async function getCustomerRetentionAnalysis() {
    const results = await FactOrderItem.aggregate([
        // Group by customer
        {
            $group: {
                _id: '$customer_id',
                order_count: { $sum: 1 },
                first_order: { $min: '$ordered_at' },
                last_order: { $max: '$ordered_at' }
            }
        },

        // Calculate retention metrics
        {
            $addFields: {
                days_since_last_order: {
                    $divide: [
                        { $subtract: [new Date(), '$last_order'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },

        // Categorize retention status
        {
            $addFields: {
                retention_status: {
                    $cond: {
                        if: { $lte: ['$days_since_last_order', 30] },
                        then: 'Active',
                        else: {
                            $cond: {
                                if: { $lte: ['$days_since_last_order', 90] },
                                then: 'At Risk',
                                else: 'Churned'
                            }
                        }
                    }
                }
            }
        },

        // Group by retention status
        {
            $group: {
                _id: '$retention_status',
                customer_count: { $sum: 1 },
                avg_orders: { $avg: '$order_count' }
            }
        },

        { $sort: { customer_count: -1 } }
    ]);

    return results;
}

/**
 * Main function to run all customer analytics
 */
export async function runCustomerAnalytics() {
    try {
        await connectDB();
        console.log('👥 Running Customer Analytics...\n');

        // 1. Top Customers
        console.log('═'.repeat(60));
        console.log('1. TOP 10 CUSTOMERS BY REVENUE');
        console.log('═'.repeat(60));
        const topCustomers = await getTopCustomersByRevenue(10);
        topCustomers.forEach((c, i) => {
            console.log(`${i + 1}. ${c.customer_name || 'Unknown'}`);
            console.log(`   Revenue: ${c.total_revenue.toLocaleString()} VND`);
            console.log(`   Orders: ${c.total_orders}`);
            console.log(`   Avg Order: ${c.avg_order_value.toLocaleString()} VND`);
            console.log(`   Tier: ${c.customer_tier || 'N/A'}\n`);
        });

        // 2. Customer Segmentation
        console.log('═'.repeat(60));
        console.log('2. CUSTOMER SEGMENTATION BY TIER');
        console.log('═'.repeat(60));
        const segmentation = await getCustomerSegmentationByTier();
        segmentation.forEach(seg => {
            console.log(`${seg.tier || 'Unknown'}:`);
            console.log(`   Customers: ${seg.customer_count}`);
            console.log(`   Revenue: ${seg.total_revenue.toLocaleString()} VND`);
            console.log(`   Avg Revenue/Customer: ${seg.avg_revenue_per_customer.toLocaleString()} VND`);
            console.log(`   Avg Orders/Customer: ${seg.avg_orders_per_customer.toFixed(1)}\n`);
        });

        // 3. Purchase Frequency
        console.log('═'.repeat(60));
        console.log('3. PURCHASE FREQUENCY DISTRIBUTION');
        console.log('═'.repeat(60));
        const frequency = await getCustomerPurchaseFrequency();
        const freqDistribution = frequency.reduce((acc, c) => {
            acc[c.frequency_category] = (acc[c.frequency_category] || 0) + 1;
            return acc;
        }, {});

        Object.entries(freqDistribution).forEach(([category, count]) => {
            console.log(`${category}: ${count} customers`);
        });
        console.log('');

        // 4. Retention Analysis
        console.log('═'.repeat(60));
        console.log('4. CUSTOMER RETENTION STATUS');
        console.log('═'.repeat(60));
        const retention = await getCustomerRetentionAnalysis();
        retention.forEach(r => {
            console.log(`${r._id}: ${r.customer_count} customers (Avg ${r.avg_orders.toFixed(1)} orders)`);
        });

        console.log('\n✅ Customer Analytics Complete!\n');

        return {
            topCustomers,
            segmentation,
            frequency,
            retention
        };
    } catch (err) {
        console.error('❌ Error in customer analytics:', err);
        throw err;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCustomerAnalytics()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
