import mongoose from 'mongoose';
import 'dotenv/config';

if (!process.env.MONGODB_WAREHOUSE_URL) {
    throw new Error('❌ Thiếu MONGODB_WAREHOUSE_URL trong .env (DB kho)');
}

let whConn = null;

export async function connectWarehouseDB() {
    if (whConn && whConn.readyState === 1) return whConn;

    whConn = await mongoose.createConnection(
        process.env.MONGODB_WAREHOUSE_URL
    ).asPromise();

    console.log('✅ Kết nối MongoDB Warehouse (source) thành công:', whConn.name);
    return whConn;
}
