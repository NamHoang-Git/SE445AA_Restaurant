// controllers/analytics.controller.js
import {
    getProfitSummary,
    getProfitMarginByProduct,
    getHighestMarginProducts,
    getLowestMarginProducts,
    getROIAnalysis,
    getTotalProfitByCategory
} from '../analytics/profit_analysis.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import DimCustomer from '../models/dw/dimCustomer.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';
import StagingError from '../models/staging/stagingError.model.js';
import StagingUser from '../models/staging/stagingUser.model.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import StagingOrderItem from '../models/staging/stagingOrderItem.model.js';
import StagingWhImport from '../models/staging/stagingWhImport.model.js';

/**
 * GET /api/analytics/profit/summary
 * Get overall profit summary
 */
export async function getProfitSummaryController(req, res) {
    try {
        const summary = await getProfitSummary();
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error in getProfitSummary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profit summary',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/profit/margins
 * Get profit margins for all products
 */
export async function getProfitMarginsController(req, res) {
    try {
        const margins = await getProfitMarginByProduct();
        res.json({
            success: true,
            data: margins
        });
    } catch (error) {
        console.error('Error in getProfitMargins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profit margins',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/profit/top-products
 * Get highest margin products
 */
export async function getTopProductsController(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topProducts = await getHighestMarginProducts(limit);
        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get top products',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/profit/low-margin
 * Get lowest margin products
 */
export async function getLowMarginProductsController(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const lowProducts = await getLowestMarginProducts(limit);
        res.json({
            success: true,
            data: lowProducts
        });
    } catch (error) {
        console.error('Error in getLowMarginProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get low margin products',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/profit/roi
 * Get ROI analysis
 */
export async function getROIController(req, res) {
    try {
        const roi = await getROIAnalysis();
        res.json({
            success: true,
            data: roi
        });
    } catch (error) {
        console.error('Error in getROI:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ROI analysis',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/profit/by-category
 * Get profit by category
 */
export async function getProfitByCategoryController(req, res) {
    try {
        const categoryProfit = await getTotalProfitByCategory();
        res.json({
            success: true,
            data: categoryProfit
        });
    } catch (error) {
        console.error('Error in getProfitByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profit by category',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/integration/status
 * Get data integration status
 */
export async function getIntegrationStatusController(req, res) {
    try {
        // Count products with warehouse data
        const totalProducts = await DimMenuItem.countDocuments();
        const productsWithWarehouseData = await DimMenuItem.countDocuments({
            avg_import_cost: { $ne: null, $gt: 0 }
        });

        // Count records in staging
        const stagingCounts = {
            users: await StagingUser.countDocuments(),
            products: await StagingProduct.countDocuments(),
            orders: await StagingOrderItem.countDocuments(),
            warehouse_imports: await StagingWhImport.countDocuments()
        };

        // Count records in DW
        const dwCounts = {
            customers: await DimCustomer.countDocuments(),
            menu_items: await DimMenuItem.countDocuments(),
            order_items: await FactOrderItem.countDocuments()
        };

        // Calculate merge success rate
        const mergeSuccessRate = totalProducts > 0
            ? (productsWithWarehouseData / totalProducts * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            data: {
                total_products: totalProducts,
                products_with_warehouse_data: productsWithWarehouseData,
                merge_success_rate: parseFloat(mergeSuccessRate),
                staging_counts: stagingCounts,
                dw_counts: dwCounts,
                integration_active: productsWithWarehouseData > 0
            }
        });
    } catch (error) {
        console.error('Error in getIntegrationStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get integration status',
            error: error.message
        });
    }
}

/**
 * GET /api/analytics/quality/metrics
 * Get data quality metrics
 */
export async function getQualityMetricsController(req, res) {
    try {
        // Total records processed
        const totalStaging = await StagingUser.countDocuments() +
            await StagingProduct.countDocuments() +
            await StagingOrderItem.countDocuments();

        // Error records
        const totalErrors = await StagingError.countDocuments();

        // Error breakdown by source
        const errorBreakdown = await StagingError.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate error rate
        const errorRate = totalStaging > 0
            ? (totalErrors / (totalStaging + totalErrors) * 100).toFixed(2)
            : 0;

        // Data quality score (100 - error_rate)
        const qualityScore = (100 - parseFloat(errorRate)).toFixed(2);

        // Count cleaned records (records with _original_name field)
        const cleanedUsers = await StagingUser.countDocuments({
            _original_name: { $exists: true }
        });

        res.json({
            success: true,
            data: {
                total_records_processed: totalStaging,
                total_errors: totalErrors,
                error_rate: parseFloat(errorRate),
                quality_score: parseFloat(qualityScore),
                cleaned_records: cleanedUsers,
                error_breakdown: errorBreakdown,
                status: qualityScore >= 90 ? 'Excellent' :
                    qualityScore >= 70 ? 'Good' :
                        qualityScore >= 50 ? 'Fair' : 'Poor'
            }
        });
    } catch (error) {
        console.error('Error in getQualityMetrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quality metrics',
            error: error.message
        });
    }
}
