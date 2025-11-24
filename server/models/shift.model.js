import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    shiftType: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'absent', 'late'],
        default: 'scheduled'
    },
    assignedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    actualHours: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Index for efficient queries
shiftSchema.index({ employeeId: 1, date: 1 });
shiftSchema.index({ date: 1, shiftType: 1 });

// Calculate actual hours when check-out
shiftSchema.pre('save', function (next) {
    if (this.checkInTime && this.checkOutTime) {
        const hours = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
        this.actualHours = Math.round(hours * 100) / 100; // Round to 2 decimals
    }
    next();
});

const ShiftModel = mongoose.model("shift", shiftSchema);

export default ShiftModel;
