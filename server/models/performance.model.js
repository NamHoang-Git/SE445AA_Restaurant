import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    totalHours: {
        type: Number,
        default: 0
    },
    totalShifts: {
        type: Number,
        default: 0
    },
    completedShifts: {
        type: Number,
        default: 0
    },
    lateCheckIns: {
        type: Number,
        default: 0
    },
    absences: {
        type: Number,
        default: 0
    },
    // For Waiter
    ordersProcessed: {
        type: Number,
        default: 0
    },
    // For Chef
    dishesCooked: {
        type: Number,
        default: 0
    },
    // Optional - for future
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    customerFeedback: [{
        orderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'order'
        },
        rating: Number,
        comment: String,
        date: Date
    }]
}, { timestamps: true });

// Compound index for unique employee-month-year
performanceSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const PerformanceModel = mongoose.model("performance", performanceSchema);

export default PerformanceModel;
