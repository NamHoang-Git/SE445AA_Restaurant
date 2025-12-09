import mongoose from "mongoose";
import { exec } from "child_process";
import path from "path";

export async function getEtlSummary(req, res) {
    try {
        const db = mongoose.connection.db;

        const [
            stagingUsers,
            stagingProducts,
            stagingOrders,
            stagingWhImports,
            stagingWhExports,
            stagingErrors,
            dimCustomers,
            dimMenuItems,
            factOrderItems,
            factInventory,
        ] = await Promise.all([
            db.collection("staging_users").countDocuments(),
            db.collection("staging_products").countDocuments(),
            db.collection("staging_order_items").countDocuments(),
            db.collection("staging_wh_imports").countDocuments(),
            db.collection("staging_wh_exports").countDocuments(),
            db.collection("staging_errors").countDocuments(),
            db.collection("dw_dim_customers").countDocuments(),
            db.collection("dw_dim_menu_items").countDocuments(),
            db.collection("dw_fact_order_items").countDocuments(),
            db.collection("dw_fact_inventory_movements").countDocuments(),
        ]);

        return res.json({
            success: true,
            data: {
                staging: {
                    users: stagingUsers,
                    products: stagingProducts,
                    orders: stagingOrders,
                    wh_imports: stagingWhImports,
                    wh_exports: stagingWhExports,
                    errors: stagingErrors,
                },
                dw: {
                    dim_customers: dimCustomers,
                    dim_menu_items: dimMenuItems,
                    fact_order_items: factOrderItems,
                    fact_inventory_movement: factInventory,
                },
                lastRunAt: new Date(),
            },
        });
    } catch (error) {
        console.error("getEtlSummary error:", error);
        return res.status(500).json({
            success: false,
            message: "Không lấy được ETL summary",
        });
    }
}

/**
 * POST /api/etl/run
 * Trigger ETL pipeline by running run_etl_all.bat
 */
export async function runEtlPipeline(req, res) {
    try {
        const batPath = path.join(process.cwd(), "run_etl_v2.bat");

        // Wrap path in quotes to handle spaces in directory names
        const command = `"${batPath}"`;

        console.log("🚀 Starting ETL pipeline...");
        console.log("📂 Working directory:", process.cwd());
        console.log("🎯 Command:", command);

        // Execute the batch file with proper quote handling
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ ETL execution error:", error);
                return;
            }
            if (stderr) {
                console.error("⚠️ ETL stderr:", stderr);
            }
            console.log("✅ ETL completed:", stdout);
        });

        // Return immediately - ETL runs in background
        return res.json({
            success: true,
            message: "ETL pipeline đã được khởi chạy. Quá trình đang chạy trong background.",
        });
    } catch (error) {
        console.error("runEtlPipeline error:", error);
        return res.status(500).json({
            success: false,
            message: "Không thể khởi chạy ETL pipeline",
            error: error.message,
        });
    }
}

/**
 * GET /api/etl/analytics
 * Lấy dữ liệu analytics cho charts
 */
export async function getAnalytics(req, res) {
    try {
        const db = mongoose.connection.db;

        // Best Sellers - Top 5 products by quantity sold
        const bestSellers = await db
            .collection("dw_fact_order_items")
            .aggregate([
                {
                    $group: {
                        _id: "$product_id",
                        totalQuantity: { $sum: "$quantity" },
                        totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 }
            ])
            .toArray();

        // Get product names
        const dimMenuItems = await db.collection("dw_dim_menu_items").find({}).toArray();
        const nameMap = new Map(dimMenuItems.map(d => [d.product_id, d.name]));

        const bestSellersData = bestSellers.map(item => ({
            product_id: item._id,
            name: nameMap.get(item._id) || item._id,
            quantity: item.totalQuantity,
            revenue: item.totalRevenue
        }));

        // Top Revenue - Top 5 products by revenue
        const topRevenue = await db
            .collection("dw_fact_order_items")
            .aggregate([
                {
                    $group: {
                        _id: "$product_id",
                        totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 }
            ])
            .toArray();

        const topRevenueData = topRevenue.map(item => ({
            product_id: item._id,
            name: nameMap.get(item._id) || item._id,
            revenue: item.totalRevenue
        }));

        return res.json({
            success: true,
            data: {
                bestSellers: bestSellersData,
                topRevenue: topRevenueData
            }
        });
    } catch (error) {
        console.error("getAnalytics error:", error);
        return res.status(500).json({
            success: false,
            message: "Không lấy được analytics data",
        });
    }
}
