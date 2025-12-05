// analytics/product_analytics.js
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

/**
 * 1. Get best selling products by quantity
 */
export async function getBestSellingProducts(limit = 10) {
    const results = await FactOrderItem.aggregate([
        // Group by product
        {
            $group: {
                _id: '$product_id',
                total_quantity: { $sum: '$quantity' },
                total_revenue: { $sum: '$total' },
                order_count: { $sum: 1 }
            }
        },

        // Join with product details
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: '_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },

        // Project final fields
        {
            $project: {
                product_id: '$_id',
                product_name: '$product_info.name',
                total_quantity: 1,
                total_revenue: 1,
                order_count: 1,
                avg_price: { $divide: ['$total_revenue', '$total_quantity'] }
            }
        },

        // Sort by quantity
        { $sort: { total_quantity: -1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * 2. Get products by revenue
 */
export async function getProductsByRevenue(limit = 10) {
    const results = await FactOrderItem.aggregate([
        // Group by product
        {
            $group: {
                _id: '$product_id',
                total_revenue: { $sum: '$total' },
                total_quantity: { $sum: '$quantity' },
                order_count: { $sum: 1 }
            }
        },

        // Join with product details
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: '_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },

        // Project final fields
        {
            $project: {
                product_id: '$_id',
                product_name: '$product_info.name',
                total_revenue: 1,
                total_quantity: 1,
                order_count: 1,
                avg_order_value: { $divide: ['$total_revenue', '$order_count'] }
            }
        },

        // Sort by revenue
        { $sort: { total_revenue: -1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * 3. Get category performance
 */
export async function getCategoryPerformance() {
    const results = await FactOrderItem.aggregate([
        // Join with product details
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: 'product_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },

        // Unwind categories (products can have multiple)
        { $unwind: { path: '$product_info.category_ids', preserveNullAndEmptyArrays: true } },

        // Group by category
        {
            $group: {
                _id: '$product_info.category_ids',
                total_revenue: { $sum: '$total' },
                total_quantity: { $sum: '$quantity' },
                order_count: { $sum: 1 },
                unique_products: { $addToSet: '$product_id' }
            }
        },

        // Calculate metrics
        {
            $project: {
                category_id: '$_id',
                total_revenue: 1,
                total_quantity: 1,
                order_count: 1,
                product_count: { $size: '$unique_products' },
                avg_revenue_per_product: {
                    $divide: ['$total_revenue', { $size: '$unique_products' }]
                }
            }
        },

        // Sort by revenue
        { $sort: { total_revenue: -1 } }
    ]);

    return results;
}

/**
 * 4. Get slow-moving products
 * Products with low sales volume
 */
export async function getSlowMovingProducts(limit = 10) {
    // First, get all products
    const allProducts = await DimMenuItem.find({}).select('product_id name price').lean();

    // Get sales data
    const salesData = await FactOrderItem.aggregate([
        {
            $group: {
                _id: '$product_id',
                total_quantity: { $sum: '$quantity' },
                total_revenue: { $sum: '$total' },
                order_count: { $sum: 1 },
                last_order: { $max: '$ordered_at' }
            }
        }
    ]);

    // Create map of sales
    const salesMap = new Map(salesData.map(s => [s._id, s]));

    // Find products with low/no sales
    const slowMoving = allProducts.map(product => {
        const sales = salesMap.get(product.product_id) || {
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0,
            last_order: null
        };

        return {
            product_id: product.product_id,
            product_name: product.name,
            price: product.price,
            total_quantity: sales.total_quantity,
            total_revenue: sales.total_revenue,
            order_count: sales.order_count,
            last_order: sales.last_order,
            days_since_last_order: sales.last_order
                ? Math.floor((new Date() - new Date(sales.last_order)) / (1000 * 60 * 60 * 24))
                : null
        };
    });

    // Sort by quantity (ascending) and limit
    return slowMoving
        .sort((a, b) => a.total_quantity - b.total_quantity)
        .slice(0, limit);
}

/**
 * 5. Get product trends
 * Compare recent vs older sales
 */
export async function getProductTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const results = await FactOrderItem.aggregate([
        // Categorize by time period
        {
            $addFields: {
                period: {
                    $cond: {
                        if: { $gte: ['$ordered_at', thirtyDaysAgo] },
                        then: 'recent',
                        else: 'older'
                    }
                }
            }
        },

        // Group by product and period
        {
            $group: {
                _id: {
                    product_id: '$product_id',
                    period: '$period'
                },
                total_quantity: { $sum: '$quantity' },
                total_revenue: { $sum: '$total' }
            }
        },

        // Reshape data
        {
            $group: {
                _id: '$_id.product_id',
                periods: {
                    $push: {
                        period: '$_id.period',
                        quantity: '$total_quantity',
                        revenue: '$total_revenue'
                    }
                }
            }
        },

        // Join with product details
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: '_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: { path: '$product_info', preserveNullAndEmptyArrays: true } },

        // Calculate trend
        {
            $addFields: {
                product_name: '$product_info.name',
                recent_sales: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$periods',
                                cond: { $eq: ['$$this.period', 'recent'] }
                            }
                        },
                        0
                    ]
                },
                older_sales: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$periods',
                                cond: { $eq: ['$$this.period', 'older'] }
                            }
                        },
                        0
                    ]
                }
            }
        },

        {
            $addFields: {
                trend: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: ['$recent_sales', null] },
                                { $ne: ['$older_sales', null] }
                            ]
                        },
                        then: {
                            $cond: {
                                if: { $gt: ['$recent_sales.quantity', '$older_sales.quantity'] },
                                then: 'Growing',
                                else: {
                                    $cond: {
                                        if: { $lt: ['$recent_sales.quantity', '$older_sales.quantity'] },
                                        then: 'Declining',
                                        else: 'Stable'
                                    }
                                }
                            }
                        },
                        else: 'Insufficient Data'
                    }
                }
            }
        }
    ]);

    return results;
}

/**
 * Main function to run all product analytics
 */
export async function runProductAnalytics() {
    try {
        await connectDB();
        console.log('📦 Running Product Analytics...\n');

        // 1. Best Sellers
        console.log('═'.repeat(60));
        console.log('1. TOP 10 BEST SELLING PRODUCTS (By Quantity)');
        console.log('═'.repeat(60));
        const bestSellers = await getBestSellingProducts(10);
        bestSellers.forEach((p, i) => {
            console.log(`${i + 1}. ${p.product_name || 'Unknown'}`);
            console.log(`   Quantity Sold: ${p.total_quantity}`);
            console.log(`   Revenue: ${p.total_revenue.toLocaleString()} VND`);
            console.log(`   Orders: ${p.order_count}\n`);
        });

        // 2. By Revenue
        console.log('═'.repeat(60));
        console.log('2. TOP 10 PRODUCTS BY REVENUE');
        console.log('═'.repeat(60));
        const byRevenue = await getProductsByRevenue(10);
        byRevenue.forEach((p, i) => {
            console.log(`${i + 1}. ${p.product_name || 'Unknown'}`);
            console.log(`   Revenue: ${p.total_revenue.toLocaleString()} VND`);
            console.log(`   Quantity: ${p.total_quantity}`);
            console.log(`   Avg Order Value: ${p.avg_order_value.toLocaleString()} VND\n`);
        });

        // 3. Category Performance
        console.log('═'.repeat(60));
        console.log('3. CATEGORY PERFORMANCE');
        console.log('═'.repeat(60));
        const categories = await getCategoryPerformance();
        categories.forEach((c, i) => {
            console.log(`${i + 1}. Category: ${c.category_id || 'Unknown'}`);
            console.log(`   Revenue: ${c.total_revenue.toLocaleString()} VND`);
            console.log(`   Products: ${c.product_count}`);
            console.log(`   Avg Revenue/Product: ${c.avg_revenue_per_product.toLocaleString()} VND\n`);
        });

        // 4. Slow Moving
        console.log('═'.repeat(60));
        console.log('4. SLOW-MOVING PRODUCTS');
        console.log('═'.repeat(60));
        const slowMoving = await getSlowMovingProducts(5);
        slowMoving.forEach((p, i) => {
            console.log(`${i + 1}. ${p.product_name}`);
            console.log(`   Quantity Sold: ${p.total_quantity}`);
            console.log(`   Revenue: ${p.total_revenue.toLocaleString()} VND`);
            if (p.days_since_last_order !== null) {
                console.log(`   Days Since Last Order: ${p.days_since_last_order}`);
            } else {
                console.log(`   Never Ordered`);
            }
            console.log('');
        });

        console.log('✅ Product Analytics Complete!\n');

        return {
            bestSellers,
            byRevenue,
            categories,
            slowMoving
        };
    } catch (err) {
        console.error('❌ Error in product analytics:', err);
        throw err;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runProductAnalytics()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
