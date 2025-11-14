import mongoose from 'mongoose';

const StagingWhExportSchema = new mongoose.Schema({
    export_id: { type: String, index: true },
    product_id: String,
    quantity: Number,
    reason: String,
    export_date: Date,
}, {
    timestamps: true,
    collection: 'staging_wh_exports',
});

export default mongoose.models.StagingWhExport
    || mongoose.model('StagingWhExport', StagingWhExportSchema);
