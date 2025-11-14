import mongoose from 'mongoose';
import { connectWarehouseDB } from '../../config/connectWarehouseDB.js';

const conn = await connectWarehouseDB();

const WhExportSchema = new mongoose.Schema({
    export_code: { type: String, unique: true },
    product_code: String,
    quantity: Number,
    reason: String,     // SALE / WASTE / DAMAGE...
    export_date: Date,
}, {
    timestamps: true,
    collection: 'wh_exports',
});

export default conn.models.WhExport
    || conn.model('WhExport', WhExportSchema);
