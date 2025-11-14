import mongoose from 'mongoose';
const StagingOrderItemSchema = new mongoose.Schema({
    order_id: { type: String, index: true },
    customer_id: String,
    product_id: String,
    product_name: String,
    quantity: Number,
    unit_price: Number,
    subtotal: Number,
    discount: Number,
    total: Number,
    payment_method: String,
    payment_status: String,
    order_status: String,
    ordered_at: Date,
    completed_at: Date,
    voucher_id: String,
    table_number: String,
}, { timestamps: true, collection: 'staging_order_items' });

export default mongoose.models.StagingOrderItem
    || mongoose.model('StagingOrderItem', StagingOrderItemSchema);
