// scripts/transform_load.js
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import StagingUser from '../models/staging/stagingUser.model.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import StagingOrderItem from '../models/staging/stagingOrderItem.model.js';
import DimCustomer from '../models/dw/dimCustomer.model.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';
import { CustomerTransformStrategy } from "../strategies/customerTransform.strategy.js";
import { MenuItemTransformStrategy } from "../strategies/menuItemTransform.strategy.js";
import { OrderItemTransformStrategy } from "../strategies/orderItemTransform.strategy.js";

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function writeEtlLog(msg) {
    const line = `[${new Date().toISOString()}] [ETL] ${msg}\n`;
    fs.appendFileSync(path.join(LOG_DIR, "etl.log"), line, "utf8");
}

async function buildDimCustomer() {
    console.log("🧱 Rebuild dim_customer...");
    writeEtlLog("Rebuild dim_customer");
    await DimCustomer.deleteMany({});

    const stagingUsers = await StagingUser.find({}).lean();
    if (!stagingUsers.length) {
        console.warn("⚠️ staging_users trống");
        writeEtlLog("WARN: staging_users empty");
        return new Map();
    }

    const strategy = new CustomerTransformStrategy();
    const docs = strategy.transform(stagingUsers);

    if (!docs.length) {
        console.warn("⚠️ Không có dữ liệu hợp lệ để build dim_customer");
        writeEtlLog("WARN: no valid docs for dim_customer");
        return new Map();
    }

    const inserted = await DimCustomer.insertMany(docs, { ordered: true });
    console.log(`✅ dim_customer inserted: ${inserted.length}`);
    writeEtlLog(`dim_customer inserted: ${inserted.length}`);

    const map = new Map();
    for (const d of inserted) {
        map.set(d.customer_id, d._id);
    }
    return map;
}

async function buildDimMenuItem() {
    console.log("🧱 Rebuild dim_menu_item...");
    writeEtlLog("Rebuild dim_menu_item");
    await DimMenuItem.deleteMany({});

    const stagingProducts = await StagingProduct.find({}).lean();
    if (!stagingProducts.length) {
        console.warn("⚠️ staging_products trống");
        writeEtlLog("WARN: staging_products empty");
        return new Map();
    }

    const strategy = new MenuItemTransformStrategy();
    const docs = strategy.transform(stagingProducts);

    if (!docs.length) {
        console.warn("⚠️ Không có dữ liệu hợp lệ để build dim_menu_item");
        writeEtlLog("WARN: no valid docs for dim_menu_item");
        return new Map();
    }

    const inserted = await DimMenuItem.insertMany(docs, { ordered: true });
    console.log(`✅ dim_menu_item inserted: ${inserted.length}`);
    writeEtlLog(`dim_menu_item inserted: ${inserted.length}`);

    const map = new Map();
    for (const d of inserted) {
        map.set(d.product_id, d._id);
    }
    return map;
}

async function buildFactOrderItems(customerMap, menuItemMap) {
    console.log("🧱 Rebuild fact_order_item...");
    writeEtlLog("Rebuild fact_order_item");
    await FactOrderItem.deleteMany({});

    const stagingOrders = await StagingOrderItem.find({}).lean();
    if (!stagingOrders.length) {
        console.warn("⚠️ staging_order_items trống");
        writeEtlLog("WARN: staging_order_items empty");
        return;
    }

    const strategy = new OrderItemTransformStrategy();
    const docs = strategy.transform(stagingOrders, customerMap, menuItemMap);

    if (!docs.length) {
        console.warn("⚠️ Không có dữ liệu hợp lệ để build fact_order_item");
        writeEtlLog("WARN: no valid docs for fact_order_item");
        return;
    }

    const inserted = await FactOrderItem.insertMany(docs, { ordered: true });
    console.log(`✅ fact_order_item inserted: ${inserted.length}`);
    writeEtlLog(`fact_order_item inserted: ${inserted.length}`);
}

async function main() {
    try {
        await connectDB();
        writeEtlLog("=== ETL Transform & Load START ===");

        const customerMap = await buildDimCustomer();
        const menuItemMap = await buildDimMenuItem();
        await buildFactOrderItems(customerMap, menuItemMap);

        console.log('🎉 Transform & Load hoàn tất!');
        writeEtlLog("=== ETL Transform & Load DONE ===");
        process.exit(0);
    } catch (err) {
        console.error('🚨 Lỗi Transform & Load:', err);
        writeEtlLog(`ERROR: ${err.message}`);
        process.exit(1);
    }
}

main();
