import mongoose from 'mongoose';
const StagingErrorSchema = new mongoose.Schema({
    queue: String,
    reason: [String],
    payload: mongoose.Schema.Types.Mixed,
}, { timestamps: true, collection: 'staging_errors' });

export default mongoose.models.StagingError
    || mongoose.model('StagingError', StagingErrorSchema);
