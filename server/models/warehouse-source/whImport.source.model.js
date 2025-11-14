import mongoose from 'mongoose';
import { connectWarehouseDB } from '../../config/connectWarehouseDB.js';

const conn = await connectWarehouseDB();

const WhImportSchema = new mongoose.Schema({
    import_code: { type: String, unique: true },
    product_code: String,   // join sang wh_products.product_code
    quantity: Number,
    unit_cost: Number,
    import_date: Date,
    supplier: String,
}, {
    timestamps: true,
    collection: 'wh_imports',
});

export default conn.models.WhImport
    || conn.model('WhImport', WhImportSchema);
