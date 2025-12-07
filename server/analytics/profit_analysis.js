// analytics/profit_analysis_v2.js - Fixed for CS445K real data
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

/**
 * Get profit summary - ONLY for products with warehouse cost
 */
export async function getProfitSummary() {
    // First, get product IDs that have warehouse cost
    const productsWithCost = await DimMenuItem.find({
        avg_import_cost: { $ne: null, $gt: 0 }
    }).select('product_id');

    const productIds = productsWithCost.map(p => p.product_id);

    if (productIds.length === 0) {
        return {
            total_revenue: 0,
            total_cost: 0,
            total_profit: 0,
            total_orders: 0,
            avg_profit_per_order: 0,
            overall_profit_margin: 0,
            roi: 0,
            products_analyzed: 0
        };
    }

    const [summary] = await FactOrderItem.aggregate([
        // FILTER: Only orders for products with warehouse cost
        { $match: { product_id: { $in: productIds } } },

        // Join with menu items
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: 'product_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: '$product_info' },

        // Double-check has cost
        {
            $match: {
                'product_info.avg_import_cost': { $ne: null, $gt: 0 }
            }
        },

        // Calculate profit for each item
        {
            $addFields: {
                item_cost: {
                    $multiply: ['$quantity', '$product_info.avg_import_cost']
                },
                item_profit: {
                    $subtract: [
                        '$total',
                        { $multiply: ['$quantity', '$product_info.avg_import_cost'] }
                    ]
                }
            }
        },

        // Aggregate totals
        {
            $group: {
                _id: null,
                total_revenue: { $sum: '$total' },
                total_cost: { $sum: '$item_cost' },
                total_profit: { $sum: '$item_profit' },
                total_orders: { $sum: 1 },
                avg_profit_per_order: { $avg: '$item_profit' }
            }
        },

        // Calculate overall metrics
        {
            $project: {
                _id: 0,
                total_revenue: 1,
                total_cost: 1,
                total_profit: 1,
                total_orders: 1,
                avg_profit_per_order: 1,
                overall_profit_margin: {
                    $cond: {
                        if: { $gt: ['$total_revenue', 0] },
                        then: {
                            $multiply: [
                                { $divide: ['$total_profit', '$total_revenue'] },
                                100
                            ]
                        },
                        else: 0
                    }
                },
                roi: {
                    $cond: {
                        if: { $gt: ['$total_cost', 0] },
                        then: {
                            $multiply: [
                                { $divide: ['$total_profit', '$total_cost'] },
                                100
                            ]
                        },
                        else: 0
                    }
                },
                products_analyzed: { $literal: productIds.length }
            }
        }
    ]);

    return summary || {
        total_revenue: 0,
        total_cost: 0,
        total_profit: 0,
        total_orders: 0,
        avg_profit_per_order: 0,
        overall_profit_margin: 0,
        roi: 0,
        products_analyzed: productIds.length
    };
}

/**
 * Get ROI analysis - ONLY for products with warehouse cost
 */
export async function getROIAnalysis() {
    // Get product IDs with cost
    const productsWithCost = await DimMenuItem.find({
        avg_import_cost: { $ne: null, $gt: 0 }
    }).select('product_id');

    const productIds = productsWithCost.map(p => p.product_id);

    const results = await FactOrderItem.aggregate([
        // FILTER: Only orders for products with warehouse cost
        { $match: { product_id: { $in: productIds } } },

        // Join with menu items
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: 'product_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: '$product_info' },

        // Double-check has cost
        {
            $match: {
                'product_info.avg_import_cost': { $ne: null, $gt: 0 }
            }
        },

        // Group by product
        {
            $group: {
                _id: '$product_id',
                product_name: { $first: '$product_info.name' },
                total_revenue: { $sum: '$total' },
                total_quantity_sold: { $sum: '$quantity' },
                avg_import_cost: { $first: '$product_info.avg_import_cost' }
            }
        },

        // Calculate total cost and ROI
        {
            $addFields: {
                total_cost: {
                    $multiply: ['$total_quantity_sold', '$avg_import_cost']
                }
            }
        },

        {
            $addFields: {
                total_profit: {
                    $subtract: ['$total_revenue', '$total_cost']
                },
                roi_percent: {
                    $cond: {
                        if: { $gt: ['$total_cost', 0] },
                        then: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ['$total_revenue', '$total_cost'] },
                                        '$total_cost'
                                    ]
                                },
                                100
                            ]
                        },
                        else: 0
                    }
                }
            }
        },

        // Sort by ROI
        { $sort: { roi_percent: -1 } }
    ]);

    return results;
}

/**
 * Get total profit by category - ONLY for products with warehouse cost
 */
export async function getTotalProfitByCategory() {
    const productsWithCost = await DimMenuItem.find({
        avg_import_cost: { $ne: null, $gt: 0 }
    }).select('product_id');

    const productIds = productsWithCost.map(p => p.product_id);

    const results = await FactOrderItem.aggregate([
        // FILTER: Only orders for products with warehouse cost
        { $match: { product_id: { $in: productIds } } },

        // Join with menu items
        {
            $lookup: {
                from: 'dw_dim_menu_items',
                localField: 'product_id',
                foreignField: 'product_id',
                as: 'product_info'
            }
        },
        { $unwind: '$product_info' },

        // Only products with cost
        {
            $match: {
                'product_info.avg_import_cost': { $ne: null, $gt: 0 }
            }
        },

        // Calculate profit for each order item
        {
            $addFields: {
                item_cost: {
                    $multiply: ['$quantity', '$product_info.avg_import_cost']
                },
                item_profit: {
                    $subtract: [
                        '$total',
                        { $multiply: ['$quantity', '$product_info.avg_import_cost'] }
                    ]
                }
            }
        },

        // Group by category
        {
            $group: {
                _id: { $arrayElemAt: ['$product_info.category_ids', 0] },
                total_revenue: { $sum: '$total' },
                total_cost: { $sum: '$item_cost' },
                total_profit: { $sum: '$item_profit' },
                order_count: { $sum: 1 },
                avg_profit_per_order: { $avg: '$item_profit' }
            }
        },

        // Calculate profit margin
        {
            $addFields: {
                profit_margin_percent: {
                    $cond: {
                        if: { $gt: ['$total_revenue', 0] },
                        then: {
                            $multiply: [
                                { $divide: ['$total_profit', '$total_revenue'] },
                                100
                            ]
                        },
                        else: 0
                    }
                }
            }
        },

        // Sort by total profit
        { $sort: { total_profit: -1 } }
    ]);

    return results;
}

/**
 * Get profit margin by product
 */
export async function getProfitMarginByProduct() {
    const results = await DimMenuItem.aggregate([
        {
            $match: {
                avg_import_cost: { $ne: null, $gt: 0 },
                price: { $gt: 0 }  // ← Add this to prevent divide by zero
            }
        },

        {
            $project: {
                product_id: 1,
                name: 1,
                selling_price: '$price',
                import_cost: '$avg_import_cost',
                warehouse_location: 1,

                profit_per_unit: {
                    $subtract: ['$price', '$avg_import_cost']
                },

                profit_margin_percent: {
                    $multiply: [
                        {
                            $divide: [
                                { $subtract: ['$price', '$avg_import_cost'] },
                                '$price'
                            ]
                        },
                        100
                    ]
                }
            }
        },

        { $sort: { profit_margin_percent: -1 } }
    ]);

    return results;
}

/**
 * Get highest margin products
 */
export async function getHighestMarginProducts(limit = 10) {
    const results = await DimMenuItem.aggregate([
        {
            $match: {
                avg_import_cost: { $ne: null, $gt: 0 },
                price: { $gt: 0 }  // Prevent divide by zero
            }
        },

        {
            $project: {
                product_id: 1,
                name: 1,
                price: 1,
                avg_import_cost: 1,
                profit_margin_percent: {
                    $multiply: [
                        {
                            $divide: [
                                { $subtract: ['$price', '$avg_import_cost'] },
                                '$price'
                            ]
                        },
                        100
                    ]
                }
            }
        },

        { $sort: { profit_margin_percent: -1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * Get lowest margin products
 */
export async function getLowestMarginProducts(limit = 10) {
    const results = await DimMenuItem.aggregate([
        {
            $match: {
                avg_import_cost: { $ne: null, $gt: 0 },
                price: { $gt: 0 }  // Prevent divide by zero
            }
        },

        {
            $project: {
                product_id: 1,
                name: 1,
                price: 1,
                avg_import_cost: 1,
                profit_margin_percent: {
                    $multiply: [
                        {
                            $divide: [
                                { $subtract: ['$price', '$avg_import_cost'] },
                                '$price'
                            ]
                        },
                        100
                    ]
                }
            }
        },

        { $sort: { profit_margin_percent: 1 } },
        { $limit: limit }
    ]);

    return results;
}

/**
 * Main function to run all profit analyses
 */
export async function runProfitAnalysis() {
    try {
        await connectDB();
        console.log('📊 Running Profit Analysis (CS445K Real Data)...\n');

        // 1. Overall Summary
        console.log('═'.repeat(60));
        console.log('1. PROFIT SUMMARY (Products with Warehouse Cost Only)');
        console.log('═'.repeat(60));
        const summary = await getProfitSummary();
        console.log(`Products Analyzed: ${summary.products_analyzed || 0}`);
        console.log(`Total Revenue:     ${summary.total_revenue.toLocaleString()} VND`);
        console.log(`Total Cost:        ${summary.total_cost.toLocaleString()} VND`);
        console.log(`Total Profit:      ${summary.total_profit.toLocaleString()} VND`);
        console.log(`Profit Margin:     ${summary.overall_profit_margin.toFixed(2)}%`);
        console.log(`ROI:               ${summary.roi.toFixed(2)}%`);
        console.log(`Total Orders:      ${summary.total_orders}`);
        console.log(`Avg Profit/Order:  ${summary.avg_profit_per_order.toLocaleString()} VND\n`);

        // 2. Highest Margin Products
        console.log('═'.repeat(60));
        console.log('2. TOP 5 HIGHEST MARGIN PRODUCTS');
        console.log('═'.repeat(60));
        const highestMargin = await getHighestMarginProducts(5);
        highestMargin.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Price: ${p.price.toLocaleString()} VND | Cost: ${p.avg_import_cost.toLocaleString()} VND`);
            console.log(`   Margin: ${p.profit_margin_percent.toFixed(2)}%\n`);
        });

        // 3. Lowest Margin Products
        console.log('═'.repeat(60));
        console.log('3. TOP 5 LOWEST MARGIN PRODUCTS');
        console.log('═'.repeat(60));
        const lowestMargin = await getLowestMarginProducts(5);
        lowestMargin.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Price: ${p.price.toLocaleString()} VND | Cost: ${p.avg_import_cost.toLocaleString()} VND`);
            console.log(`   Margin: ${p.profit_margin_percent.toFixed(2)}%\n`);
        });

        // 4. ROI Analysis
        console.log('═'.repeat(60));
        console.log('4. ROI ANALYSIS (Products with Sales)');
        console.log('═'.repeat(60));
        const roiAnalysis = await getROIAnalysis();
        if (roiAnalysis.length > 0) {
            roiAnalysis.slice(0, 5).forEach((p, i) => {
                console.log(`${i + 1}. ${p.product_name}`);
                console.log(`   Revenue: ${p.total_revenue.toLocaleString()} VND | Cost: ${p.total_cost.toLocaleString()} VND`);
                console.log(`   Profit: ${p.total_profit.toLocaleString()} VND | ROI: ${p.roi_percent.toFixed(2)}%\n`);
            });
        } else {
            console.log('   No sales data for products with warehouse cost\n');
        }

        console.log('✅ Profit Analysis Complete!\n');

        return {
            summary,
            highestMargin,
            lowestMargin,
            roiAnalysis
        };
    } catch (err) {
        console.error('❌ Error in profit analysis:', err);
        throw err;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runProfitAnalysis()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
