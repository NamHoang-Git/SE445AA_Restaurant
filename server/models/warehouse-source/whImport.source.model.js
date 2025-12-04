import mongoose from 'mongoose';
import { connectWarehouseDB } from '../../config/connectWarehouseDB.js';

const conn = await connectWarehouseDB();

const WhImportSchema = new mongoose.Schema({
    import_code: { type: String, unique: true },
    item_code: String,        // Different from restaurant's product_id
    product_name_raw: String, // Raw name (uppercase, not cleaned)
    quantity: Number,
    unit_cost: Number,
    import_date: Date,
    supplier: String,
    warehouse_location: String, // NEW: warehouse location
}, {
    timestamps: true,
    collection: 'wh_imports',
});

export default conn.models.WhImport
    || conn.model('WhImport', WhImportSchema);
