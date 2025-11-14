import 'dotenv/config';
import connectDB from '../config/connectDB.js';

import StagingUser from '../models/staging/stagingUser.model.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import StagingOrderItem from '../models/staging/stagingOrderItem.model.js';
import DimCustomer from '../models/dw/dimCustomer.model.js';
import DimMenuItem from '../models/dw/dimMenuItem.model.js';
import FactOrderItem from '../models/dw/factOrderItem.model.js';

async function buildDimCustomer() {
    console.log('🧱 Rebuild dim_customer...');
    await DimCustomer.deleteMany({});

    const users = await StagingUser.find({}).lean();
    if (!users.length) {
        console.warn('⚠️ staging_users trống');
        return new Map();
    }

    const docs = users.map(u => ({
        customer_id: u.customer_id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        tier: u.tier,
        status: u.status,
        created_at: u.created_at,
    }));

    const inserted = await DimCustomer.insertMany(docs);
    console.log(`✅ dim_customer inserted: ${inserted.length}`);

    // map customer_id -> _id
    const map = new Map();
    for (const d of inserted) {
        map.set(d.customer_id, d._id);
    }
    return map;
}

async function buildDimMenuItem() {
    console.log('🧱 Rebuild dim_menu_item...');
    await DimMenuItem.deleteMany({});

    const products = await StagingProduct.find({}).lean();
    if (!products.length) {
        console.warn('⚠️ staging_products trống');
        return new Map();
    }

    const docs = products.map(p => ({
        product_id: p.product_id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        publish: p.publish,
        category_ids: p.category_ids || [],
        sub_category_id: p.sub_category_id || null,
        slug: p.slug || null,
        created_at: p.created_at,
    }));

    const inserted = await DimMenuItem.insertMany(docs);
    console.log(`✅ dim_menu_item inserted: ${inserted.length}`);

    const map = new Map();
    for (const d of inserted) {
        map.set(d.product_id, d._id);
    }
    return map;
}

async function buildFactOrderItems(customerMap, productMap) {
    console.log('🧱 Rebuild fact_order_item...');
    await FactOrderItem.deleteMany({});

    const items = await StagingOrderItem.find({}).lean();
    if (!items.length) {
        console.warn('⚠️ staging_order_items trống');
        return;
    }

    const docs = items.map(it => {
        const customer_key = it.customer_id
            ? customerMap.get(it.customer_id) || null
            : null;

        const menu_item_key = it.product_id
            ? productMap.get(it.product_id) || null
            : null;

        return {
            order_id: it.order_id,

            customer_key,
            menu_item_key,
            customer_id: it.customer_id || null,
            product_id: it.product_id || null,

            product_name: it.product_name,
            quantity: it.quantity,
            unit_price: it.unit_price,
            subtotal: it.subtotal,
            discount: it.discount,
            total: it.total,

            payment_method: it.payment_method,
            payment_status: it.payment_status,
            order_status: it.order_status,

            ordered_at: it.ordered_at,
            completed_at: it.completed_at,

            voucher_id: it.voucher_id,
            table_number: it.table_number,
        };
    });

    const inserted = await FactOrderItem.insertMany(docs);
    console.log(`✅ fact_order_item inserted: ${inserted.length}`);
}

async function main() {
    try {
        await connectDB();

        const customerMap = await buildDimCustomer();
        const productMap = await buildDimMenuItem();
        await buildFactOrderItems(customerMap, productMap);

        console.log('🎉 Transform & Load hoàn tất!');
        process.exit(0);
    } catch (err) {
        console.error('🚨 Lỗi Transform & Load:', err);
        process.exit(1);
    }
}

main();
