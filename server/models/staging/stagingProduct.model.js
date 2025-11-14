import mongoose from 'mongoose';
const StagingProductSchema = new mongoose.Schema({
    product_id: { type: String, index: true },
    name: String,
    price: Number,
    discount: Number,
    publish: Boolean,
    category_ids: [String],
    sub_category_id: String,
    slug: String,
    created_at: Date,
}, { timestamps: true, collection: 'staging_products' });

export default mongoose.models.StagingProduct
    || mongoose.model('StagingProduct', StagingProductSchema);
