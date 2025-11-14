import mongoose from 'mongoose';
import { connectWarehouseDB } from '../../config/connectWarehouseDB.js';

const conn = await connectWarehouseDB();

const WhProductSchema = new mongoose.Schema({
    product_code: { type: String, unique: true }, // map sang product_id bên nhà hàng
    name: String,
    unit: String, // vd: ly, chai, phần...
}, {
    timestamps: true,
    collection: 'wh_products',
});

export default conn.models.WhProduct
    || conn.model('WhProduct', WhProductSchema);
