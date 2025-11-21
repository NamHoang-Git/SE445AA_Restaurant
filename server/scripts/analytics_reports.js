// scripts/analytics_reports.js
import "dotenv/config";
import connectDB from "../config/connectDB.js";

import DimMenuItem from "../models/dw/dimMenuItem.model.js";
import FactOrderItem from "../models/dw/factOrderItem.model.js";
import FactInventoryMovement from "../models/dw/factInventoryMovement.model.js";

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function writeAnalyticsLog(msg) {
    const line = `[${new Date().toISOString()}] [ANALYTICS] ${msg}\n`;
    fs.appendFileSync(path.join(LOG_DIR, "analytics.log"), line, "utf8");
}

async function reportInventoryByProduct() {
    console.log("=== Báo cáo 1: Tồn kho theo món ===");
    writeAnalyticsLog("=== Báo cáo 1: Tồn kho theo món ===");

    const pipeline = [
        {
            $group: {
                _id: { product_id: "$product_id", type: "$movement_type" },
                totalQty: { $sum: "$quantity" },
            },
        },
        {
            $group: {
                _id: "$_id.product_id",
                importQty: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.type", "IMPORT"] }, "$totalQty", 0],
                    },
                },
                exportQty: {
                    $sum: {
                        $cond: [{ $eq: ["$_id.type", "EXPORT"] }, "$totalQty", 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                product_id: "$_id",
                importQty: 1,
                exportQty: 1,
                stockQty: { $subtract: ["$importQty", "$exportQty"] },
            },
        },
    ];

    const rows = await FactInventoryMovement.aggregate(pipeline);

    const dimItems = await DimMenuItem.find({}).lean();
    const nameMap = new Map(dimItems.map((d) => [d.product_id, d.name]));

    for (const r of rows) {
        const line =
            `- ${r.product_id} (${nameMap.get(r.product_id) || "N/A"}): ` +
            `Nhập=${r.importQty}, Xuất=${r.exportQty}, Tồn=${r.stockQty}`;
        console.log(line);
        writeAnalyticsLog(line);
    }
}

async function reportSaleVsExport() {
    console.log("\n=== Báo cáo 2: Bán ra vs Xuất kho (SALE) ===");
    writeAnalyticsLog("=== Báo cáo 2: Bán ra vs Xuất kho (SALE) ===");

    const sales = await FactOrderItem.aggregate([
        {
            $group: {
                _id: "$product_id",
                soldQty: { $sum: "$quantity" },
            },
        },
    ]);

    const saleMap = new Map(sales.map((s) => [s._id, s.soldQty]));

    const exports = await FactInventoryMovement.aggregate([
        { $match: { movement_type: "EXPORT", reason: "SALE" } },
        {
            $group: {
                _id: "$product_id",
                exportQty: { $sum: "$quantity" },
            },
        },
    ]);

    const dimItems = await DimMenuItem.find({}).lean();
    const nameMap = new Map(dimItems.map((d) => [d.product_id, d.name]));

    for (const ex of exports) {
        const pid = ex._id;
        const soldQty = saleMap.get(pid) || 0;
        const line =
            `- ${pid} (${nameMap.get(pid) || "N/A"}): ` +
            `Bán=${soldQty}, Xuất kho (SALE)=${ex.exportQty}`;
        console.log(line);
        writeAnalyticsLog(line);
    }
}

async function reportWasteRate() {
    console.log("\n=== Báo cáo 3: Hao hụt (WASTE) theo món ===");
    writeAnalyticsLog("=== Báo cáo 3: Hao hụt (WASTE) theo món ===");

    const pipeline = [
        { $match: { movement_type: "EXPORT", reason: "WASTE" } },
        {
            $group: {
                _id: "$product_id",
                wasteQty: { $sum: "$quantity" },
            },
        },
    ];

    const wastes = await FactInventoryMovement.aggregate(pipeline);

    const dimItems = await DimMenuItem.find({}).lean();
    const nameMap = new Map(dimItems.map((d) => [d.product_id, d.name]));

    for (const w of wastes) {
        const line =
            `- ${w._id} (${nameMap.get(w._id) || "N/A"}): Hao hụt=${w.wasteQty}`;
        console.log(line);
        writeAnalyticsLog(line);
    }
}

async function main() {
    try {
        await connectDB();
        writeAnalyticsLog("=== Analytics START ===");
        await reportInventoryByProduct();
        await reportSaleVsExport();
        await reportWasteRate();
        writeAnalyticsLog("=== Analytics DONE ===");
        process.exit(0);
    } catch (err) {
        console.error("Lỗi khi chạy analytics:", err);
        writeAnalyticsLog(`ERROR: ${err.message}`);
        process.exit(1);
    }
}

main();
