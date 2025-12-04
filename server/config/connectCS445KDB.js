// config/connectCS445KDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.CS445K_MONGODB_URL) {
    throw new Error("❌ Vui lòng cung cấp CS445K_MONGODB_URL trong tệp .env");
}

// Create separate connection for CS445K Restaurant database
let cs445kConnection = null;

async function connectCS445KDB() {
    try {
        if (cs445kConnection && cs445kConnection.readyState === 1) {
            return cs445kConnection;
        }

        cs445kConnection = await mongoose.createConnection(
            process.env.CS445K_MONGODB_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log("✅ Kết nối CS445K Restaurant DB thành công:", cs445kConnection.name);
        return cs445kConnection;
    } catch (error) {
        console.error("🚨 Lỗi kết nối CS445K Restaurant DB:", error.message);
        process.exit(1);
    }
}

export default connectCS445KDB;
