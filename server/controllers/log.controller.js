import mongoose from "mongoose";
import fs from "fs";
import path from "path";

/**
 * Đọc file log (nếu có), trả về mảng dòng (mới nhất trước).
 */
function readLogFile(filename, limit = 200) {
    const fullPath = path.join(process.cwd(), "logs", filename);
    if (!fs.existsSync(fullPath)) return [];

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n").filter(Boolean);
    // đảo ngược cho log mới lên trước
    return lines.slice(-limit).reverse();
}

/**
 * GET /api/etl/logs
 * Trả về logs: consumer.log, etl.log, analytics.log + staging_errors
 */
export async function getEtlLogs(req, res) {
    try {
        const db = mongoose.connection.db;

        // Logs từ collection staging_errors (ETL error)
        const stagingErrors = await db
            .collection("staging_errors")
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();

        const etlErrorLines = stagingErrors.map((err) => {
            const timestamp = err.createdAt
                ? new Date(err.createdAt).toISOString()
                : new Date().toISOString();
            return `[${timestamp}] [ETL-ERROR] ${err.queue || "ETL"}: ${err.message || err.error || JSON.stringify(err.errors || {})
                }`;
        });

        // Logs từ file
        const consumerLogs = readLogFile("consumer.log");
        const etlFileLogs = readLogFile("etl.log");
        const analyticsLogs = readLogFile("analytics.log");

        const etlLogs = [...etlErrorLines, ...etlFileLogs];

        return res.json({
            success: true,
            data: {
                consumer: consumerLogs,
                etl: etlLogs,
                analytics: analyticsLogs,
            },
        });
    } catch (error) {
        console.error("getEtlLogs error:", error);
        return res.status(500).json({
            success: false,
            message: "Không lấy được logs",
        });
    }
}
