import mongoose from 'mongoose';

const StagingWhImportSchema = new mongoose.Schema({
    import_id: { type: String, index: true },
    product_id: String,
    product_name_raw: String,  // NEW: raw product name from warehouse
    quantity: Number,
    unit_cost: Number,
    import_date: Date,
    supplier: String,
    warehouse_location: String,  // NEW: warehouse location
}, {
    timestamps: true,
    collection: 'staging_wh_imports',
});

export default mongoose.models.StagingWhImport
    || mongoose.model('StagingWhImport', StagingWhImportSchema);
