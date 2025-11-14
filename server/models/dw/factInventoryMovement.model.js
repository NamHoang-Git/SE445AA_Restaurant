import mongoose from 'mongoose';

const FactInventoryMovementSchema = new mongoose.Schema({
    movement_type: { type: String, enum: ['IMPORT', 'EXPORT'], index: true },
    movement_id: { type: String, index: true },

    product_id: String, // P001...
    menu_item_key: { type: mongoose.Schema.Types.ObjectId, ref: 'DimMenuItem' },

    quantity: Number,
    unit_cost: Number, // chỉ meaningful với IMPORT
    reason: String,    // meaningful với EXPORT

    movement_date: Date,
}, {
    timestamps: true,
    collection: 'dw_fact_inventory_movements',
});

export default mongoose.models.FactInventoryMovement
    || mongoose.model('FactInventoryMovement', FactInventoryMovementSchema);
