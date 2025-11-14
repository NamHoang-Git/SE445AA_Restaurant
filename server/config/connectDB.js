// config/connectDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URL) {
    throw new Error("❌ Vui lòng cung cấp MONGODB_URL trong tệp .env");
}

let isConnected = false;

async function connectDB() {
    try {
        if (isConnected) return;

        const conn = await mongoose.connect(process.env.MONGODB_URL);
        isConnected = conn.connections[0].readyState === 1;

        console.log("✅ Kết nối MongoDB thành công:", conn.connection.name);
    } catch (error) {
        console.error("🚨 Lỗi kết nối MongoDB:", error.message);
        process.exit(1);
    }
}

export default connectDB;
