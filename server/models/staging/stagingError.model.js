import mongoose from 'mongoose';
const StagingErrorSchema = new mongoose.Schema({
    source: String,  // Changed from 'queue' for clarity
    raw_data: mongoose.Schema.Types.Mixed,  // Original data
    cleaned_data: mongoose.Schema.Types.Mixed,  // Data after cleaning (if applicable)
    validation_errors: [String],  // List of validation errors
    error_type: String,  // VALIDATION_FAILED, DUPLICATE, MAPPING_FAILED, etc.
}, { timestamps: true, collection: 'staging_errors' });

export default mongoose.models.StagingError
    || mongoose.model('StagingError', StagingErrorSchema);
