// models/cs445k-source/order.source.model.js
import mongoose from 'mongoose';
import connectCS445KDB from '../../config/connectCS445KDB.js';

const conn = await connectCS445KDB();

// Use the same schema as CS445K
const orderSchema = new mongoose.Schema({
    orderId: String,
    userId: mongoose.Schema.ObjectId,
    productId: mongoose.Schema.ObjectId,
    product_details: {
        productId: mongoose.Schema.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
    },
    paymentId: String,
    payment_status: String,
    delivery_address: mongoose.Schema.ObjectId,
    subTotalAmt: Number,
    totalAmt: Number,
}, {
    timestamps: true,
    collection: 'orders',  // CS445K collection name
});

export default conn.models.CS445KOrder || conn.model('CS445KOrder', orderSchema);
