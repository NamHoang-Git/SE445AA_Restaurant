import ShiftModel from "../models/shift.model.js";
import UserModel from "../models/user.model.js";
import PerformanceModel from "../models/performance.model.js";

/**
 * Create/Assign shift (Manager only)
 */
export const createShift = async (req, res) => {
    try {
        const { employeeId, shiftType, date, notes } = req.body;

        // Validate required fields
        if (!employeeId || !shiftType || !date) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin ca làm việc",
                error: true,
                success: false
            });
        }

        // Check if employee exists
        const employee = await UserModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: "Không tìm thấy nhân viên",
                error: true,
                success: false
            });
        }

        // Define shift times
        const shiftTimes = {
            morning: { start: '08:00', end: '16:00' },
            afternoon: { start: '16:00', end: '22:00' },
            evening: { start: '22:00', end: '06:00' }
        };

        const times = shiftTimes[shiftType];
        if (!times) {
            return res.status(400).json({
                message: "Loại ca làm việc không hợp lệ",
                error: true,
                success: false
            });
        }

        // Check if employee already has a shift on this date
        const existingShift = await ShiftModel.findOne({
            employeeId,
            date: new Date(date)
        });

        if (existingShift) {
            return res.status(400).json({
                message: "Nhân viên đã có ca làm việc trong ngày này",
                error: true,
                success: false
            });
        }

        // Create shift
        const shift = new ShiftModel({
            employeeId,
            shiftType,
            date: new Date(date),
            startTime: times.start,
            endTime: times.end,
            assignedBy: req.user._id,
            notes: notes || ''
        });

        await shift.save();

        // Populate employee info
        await shift.populate('employeeId', 'name email role');
        await shift.populate('assignedBy', 'name');

        return res.status(201).json({
            message: "Phân công ca làm việc thành công",
            data: shift,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Get shifts by date
 */
export const getShiftsByDate = async (req, res) => {
    try {
        const { date } = req.params;

        const shifts = await ShiftModel.find({
            date: new Date(date)
        })
            .populate('employeeId', 'name email role position')
            .populate('assignedBy', 'name')
            .sort({ shiftType: 1 });

        return res.status(200).json({
            message: "Lấy danh sách ca làm việc thành công",
            data: shifts,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Get employee's shifts
 */
export const getEmployeeShifts = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const query = { employeeId: id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const shifts = await ShiftModel.find(query)
            .populate('assignedBy', 'name')
            .sort({ date: -1 });

        return res.status(200).json({
            message: "Lấy lịch làm việc thành công",
            data: shifts,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Get current user's shifts
 */
export const getMyShifts = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = { employeeId: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const shifts = await ShiftModel.find(query)
            .populate('assignedBy', 'name')
            .sort({ date: -1 });

        return res.status(200).json({
            message: "Lấy lịch làm việc của bạn thành công",
            data: shifts,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Update shift
 */
export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const shift = await ShiftModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('employeeId', 'name email role')
            .populate('assignedBy', 'name');

        if (!shift) {
            return res.status(404).json({
                message: "Không tìm thấy ca làm việc",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Cập nhật ca làm việc thành công",
            data: shift,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Delete shift
 */
export const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;

        const shift = await ShiftModel.findByIdAndDelete(id);

        if (!shift) {
            return res.status(404).json({
                message: "Không tìm thấy ca làm việc",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Xóa ca làm việc thành công",
            data: shift,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Check-in to shift
 */
export const checkIn = async (req, res) => {
    try {
        const { shiftId } = req.body;

        const shift = await ShiftModel.findById(shiftId);

        if (!shift) {
            return res.status(404).json({
                message: "Không tìm thấy ca làm việc",
                error: true,
                success: false
            });
        }

        // Verify shift belongs to current user
        if (shift.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Bạn không có quyền check-in ca làm việc này",
                error: true,
                success: false
            });
        }

        // Check if already checked in
        if (shift.checkInTime) {
            return res.status(400).json({
                message: "Bạn đã check-in ca làm việc này rồi",
                error: true,
                success: false
            });
        }

        // Update check-in time
        shift.checkInTime = new Date();

        // Check if late (more than 15 minutes after start time)
        const shiftDate = new Date(shift.date);
        const [hours, minutes] = shift.startTime.split(':');
        const scheduledStart = new Date(shiftDate);
        scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0);

        const lateMinutes = (shift.checkInTime - scheduledStart) / (1000 * 60);
        if (lateMinutes > 15) {
            shift.status = 'late';
        }

        await shift.save();

        return res.status(200).json({
            message: "Check-in thành công",
            data: shift,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

/**
 * Check-out from shift
 */
export const checkOut = async (req, res) => {
    try {
        const { shiftId } = req.body;

        const shift = await ShiftModel.findById(shiftId);

        if (!shift) {
            return res.status(404).json({
                message: "Không tìm thấy ca làm việc",
                error: true,
                success: false
            });
        }

        // Verify shift belongs to current user
        if (shift.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Bạn không có quyền check-out ca làm việc này",
                error: true,
                success: false
            });
        }

        // Check if already checked out
        if (shift.checkOutTime) {
            return res.status(400).json({
                message: "Bạn đã check-out ca làm việc này rồi",
                error: true,
                success: false
            });
        }

        // Check if checked in
        if (!shift.checkInTime) {
            return res.status(400).json({
                message: "Bạn chưa check-in ca làm việc này",
                error: true,
                success: false
            });
        }

        // Update check-out time and status
        shift.checkOutTime = new Date();
        shift.status = 'completed';
        await shift.save();

        // Update performance metrics
        const month = shift.date.getMonth() + 1;
        const year = shift.date.getFullYear();

        await PerformanceModel.findOneAndUpdate(
            { employeeId: shift.employeeId, month, year },
            {
                $inc: {
                    totalHours: shift.actualHours,
                    totalShifts: 1,
                    completedShifts: 1,
                    lateCheckIns: shift.status === 'late' ? 1 : 0
                }
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            message: "Check-out thành công",
            data: shift,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Lỗi server",
            error: true,
            success: false
        });
    }
};

export default {
    createShift,
    getShiftsByDate,
    getEmployeeShifts,
    getMyShifts,
    updateShift,
    deleteShift,
    checkIn,
    checkOut
};
