import mongoose from 'mongoose';

const FactOrderItemSchema = new mongoose.Schema({
    order_id: { type: String, index: true },

    customer_key: { type: mongoose.Schema.Types.ObjectId, ref: 'DimCustomer' },
    menu_item_key: { type: mongoose.Schema.Types.ObjectId, ref: 'DimMenuItem' },

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
}, {
    timestamps: true,
    collection: 'dw_fact_order_items',
});

export default mongoose.models.FactOrderItem
    || mongoose.model('FactOrderItem', FactOrderItemSchema);
