import "dotenv/config";
import connectDB from "../config/connectDB.js";
import StagingUser from "../models/staging/stagingUser.model.js";
import StagingProduct from "../models/staging/stagingProduct.model.js";
import StagingOrderItem from "../models/staging/stagingOrderItem.model.js";
import StagingWhImport from "../models/staging/stagingWhImport.model.js";
import StagingWhExport from "../models/staging/stagingWhExport.model.js";

async function main() {
    await connectDB();
    console.log("🧼 Reset staging collections...");

    await Promise.all([
        StagingUser.deleteMany({}),
        StagingProduct.deleteMany({}),
        StagingOrderItem.deleteMany({}),
        StagingWhImport.deleteMany({}),
        StagingWhExport.deleteMany({}),
    ]);

    console.log("✅ Done reset staging.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Lỗi reset staging:", err);
    process.exit(1);
});
