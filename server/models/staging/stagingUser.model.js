import mongoose from 'mongoose';
const StagingUserSchema = new mongoose.Schema({
    customer_id: { type: String, index: true },
    name: String,
    email: String,
    phone: String,
    tier: String,
    status: String,
    created_at: Date,
}, { timestamps: true, collection: 'staging_users' });

export default mongoose.models.StagingUser
    || mongoose.model('StagingUser', StagingUserSchema);
