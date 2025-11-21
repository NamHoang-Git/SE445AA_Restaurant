import 'dotenv/config';
import connectDB from '../config/connectDB.js';

// staging
import StagingWhImport from '../models/staging/stagingWhImport.model.js';
import StagingWhExport from '../models/staging/stagingWhExport.model.js';

import FactInventoryMovement from '../models/dw/factInventoryMovement.model.js';

import { InventoryMovementTransformStrategy } from "../strategies/inventoryMovementTransform.strategy.js";

async function rebuildFactInventoryMovement() {
    console.log("🧱 Rebuild fact_inventory_movement...");
    await FactInventoryMovement.deleteMany({});

    const imports = await StagingWhImport.find({}).lean();
    const exports = await StagingWhExport.find({}).lean();

    if (!imports.length && !exports.length) {
        console.warn("⚠️ Không có dữ liệu kho để nạp vào fact_inventory_movement");
        return;
    }

    const strategy = new InventoryMovementTransformStrategy();
    const docs = strategy.transform(imports, exports);

    if (!docs.length) {
        console.warn("⚠️ Strategy không trả về bản ghi fact_inventory_movement nào");
        return;
    }

    const inserted = await FactInventoryMovement.insertMany(docs, { ordered: true });
    console.log(`✅ fact_inventory_movement inserted: ${inserted.length}`);
}

async function main() {
    try {
        await connectDB();
        await rebuildFactInventoryMovement();
        console.log('🎉 Transform & Load Warehouse hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('🚨 Lỗi Transform & Load Warehouse:', err);
        process.exit(1);
    }
}

main();
