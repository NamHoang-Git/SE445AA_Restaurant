// models/etl_metadata.model.js
import mongoose from 'mongoose';

const EtlMetadataSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        unique: true,
        enum: ['users', 'products', 'orders', 'wh_imports', 'wh_exports']
    },
    last_run_at: {
        type: Date,
        required: true
    },
    last_run_status: {
        type: String,
        enum: ['success', 'failed', 'running'],
        default: 'success'
    },
    records_processed: {
        type: Number,
        default: 0
    },
    records_failed: {
        type: Number,
        default: 0
    },
    run_type: {
        type: String,
        enum: ['full', 'incremental'],
        default: 'full'
    },
    run_duration_ms: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'etl_metadata'
});

export default mongoose.models.EtlMetadata
    || mongoose.model('EtlMetadata', EtlMetadataSchema);
