// scripts/debug_orders.js - Debug why orders have no items
import 'dotenv/config';
import connectCS445KDB from '../config/connectCS445KDB.js';
import CS445KOrder from '../models/cs445k-source/order.source.model.js';

async function debugOrders() {
    try {
        await connectCS445KDB();
        console.log('✅ Connected to CS445K DB\n');

        // Get sample orders
        const orders = await CS445KOrder.find({}).limit(5).lean();
        console.log(`📦 Found ${orders.length} orders\n`);

        for (const order of orders) {
            console.log(`Order ID: ${order._id}`);
            console.log(`  orderItems: ${order.orderItems ? order.orderItems.length : 'undefined'}`);
            console.log(`  order_items: ${order.order_items ? order.order_items.length : 'undefined'}`);

            if (order.orderItems && order.orderItems.length > 0) {
                console.log(`  Sample item:`, JSON.stringify(order.orderItems[0], null, 2));
            } else if (order.order_items && order.order_items.length > 0) {
                console.log(`  Sample item:`, JSON.stringify(order.order_items[0], null, 2));
            } else {
                console.log(`  ⚠️  NO ITEMS!`);
            }
            console.log('');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

debugOrders();
