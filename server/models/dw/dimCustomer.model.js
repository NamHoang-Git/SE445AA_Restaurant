import mongoose from 'mongoose';

const DimCustomerSchema = new mongoose.Schema({
    customer_id: { type: String, index: true, unique: true },
    name: String,
    email: String,
    phone: String,
    tier: String,
    status: String,
    created_at: Date,
}, {
    timestamps: true,
    collection: 'dw_dim_customers',
});

export default mongoose.models.DimCustomer
    || mongoose.model('DimCustomer', DimCustomerSchema);
