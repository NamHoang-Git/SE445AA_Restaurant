import 'dotenv/config';
import connectDB from '../config/connectDB.js';

// staging
import StagingWhImport from '../models/staging/stagingWhImport.model.js';
import StagingWhExport from '../models/staging/stagingWhExport.model.js';

// DW
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactInventoryMovement from '../models/dw/factInventoryMovement.model.js';

async function buildInventoryFact() {
    console.log('🧱 Rebuild fact_inventory_movement...');
    await FactInventoryMovement.deleteMany({});

    // Map product_id -> menu_item_key (ObjectId)
    const dimItems = await DimMenuItem.find({}).lean();
    const productMap = new Map();
    for (const it of dimItems) {
        productMap.set(it.product_id, it._id);
    }

    // 1) Nhập kho
    const imports = await StagingWhImport.find({}).lean();
    const docs = [];

    for (const im of imports) {
        docs.push({
            movement_type: 'IMPORT',
            movement_id: im.import_id,
            product_id: im.product_id,
            menu_item_key: productMap.get(im.product_id) || null,
            quantity: im.quantity,
            unit_cost: im.unit_cost,
            reason: null,
            movement_date: im.import_date,
        });
    }

    // 2) Xuất kho
    const exports = await StagingWhExport.find({}).lean();
    for (const ex of exports) {
        docs.push({
            movement_type: 'EXPORT',
            movement_id: ex.export_id,
            product_id: ex.product_id,
            menu_item_key: productMap.get(ex.product_id) || null,
            quantity: ex.quantity,
            unit_cost: null,
            reason: ex.reason,
            movement_date: ex.export_date,
        });
    }

    if (!docs.length) {
        console.warn('⚠️ Không có dữ liệu kho để nạp vào fact_inventory_movement');
        return;
    }

    const inserted = await FactInventoryMovement.insertMany(docs);
    console.log(`✅ fact_inventory_movement inserted: ${inserted.length}`);
}

async function main() {
    try {
        await connectDB(); // kết nối DB ETL/DW: se445aa_restaurant_dev
        await buildInventoryFact();
        console.log('🎉 Transform & Load Warehouse hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('🚨 Lỗi Transform & Load Warehouse:', err);
        process.exit(1);
    }
}

main();
