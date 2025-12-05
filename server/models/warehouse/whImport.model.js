// models/warehouse/whImport.model.js - Warehouse import model
import mongoose from 'mongoose';

const WhImportSchema = new mongoose.Schema({
    import_id: {
        type: String,
        required: true,
        unique: true
    },
    product_id: {
        type: String,
        required: true
    },
    product_name_raw: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit_cost: {
        type: Number,
        required: true,
        min: 0
    },
    total_cost: {
        type: Number,
        default: function () {
            return this.quantity * this.unit_cost;
        }
    },
    import_date: {
        type: Date,
        default: Date.now
    },
    supplier: {
        type: String,
        default: ''
    },
    warehouse_location: {
        type: String,
        default: 'WH-MAIN'
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed'
    }
}, {
    timestamps: true,
    collection: 'warehouse_imports'
});

export default mongoose.models.WhImport
    || mongoose.model('WhImport', WhImportSchema);
