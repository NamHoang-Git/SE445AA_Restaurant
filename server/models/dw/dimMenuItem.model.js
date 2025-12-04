import mongoose from 'mongoose';

const DimMenuItemSchema = new mongoose.Schema({
    product_id: { type: String, index: true, unique: true },
    name: String,
    price: Number,
    discount: Number,
    publish: Boolean,
    category_ids: [String],
    sub_category_id: String,
    slug: String,
    created_at: Date,
    // NEW: Merged data from warehouse
    avg_import_cost: Number,
    warehouse_location: String,
}, {
    timestamps: true,
    collection: 'dw_dim_menu_items',
});

export default mongoose.models.DimMenuItem
    || mongoose.model('DimMenuItem', DimMenuItemSchema);
