// models/cs445k-source/product.source.model.js
import mongoose from 'mongoose';
import connectCS445KDB from '../../config/connectCS445KDB.js';

const conn = await connectCS445KDB();

// Use the same schema as CS445K
const productSchema = new mongoose.Schema({
    name: String,
    category: [{ type: mongoose.Schema.ObjectId }],
    subCategory: [{ type: mongoose.Schema.ObjectId }],
    price: Number,
    discount: Number,
    publish: Boolean,
    status: String,
}, {
    timestamps: true,
    collection: 'products',  // CS445K collection name
});

export default conn.models.CS445KProduct || conn.model('CS445KProduct', productSchema);
