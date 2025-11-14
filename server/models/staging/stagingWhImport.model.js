import mongoose from 'mongoose';

const StagingWhImportSchema = new mongoose.Schema({
    import_id: { type: String, index: true },
    product_id: String,
    quantity: Number,
    unit_cost: Number,
    import_date: Date,
    supplier: String,
}, {
    timestamps: true,
    collection: 'staging_wh_imports',
});

export default mongoose.models.StagingWhImport
    || mongoose.model('StagingWhImport', StagingWhImportSchema);
