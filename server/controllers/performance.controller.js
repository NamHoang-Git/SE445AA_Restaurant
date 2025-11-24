import PerformanceModel from "../models/performance.model.js";
import UserModel from "../models/user.model.js";

/**
 * Get employee performance by month/year
 */
export const getEmployeePerformance = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Vui lòng cung cấp tháng và năm",
                error: true,
                success: false
            });
        }

        const performance = await PerformanceModel.findOne({
            employeeId: id,
            month: parseInt(month),
            year: parseInt(year)
        }).populate('employeeId', 'name email role position');

        if (!performance) {
            return res.status(404).json({
                message: "Không tìm thấy dữ liệu hiệu suất",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Lấy dữ liệu hiệu suất thành công",
            data: performance,
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
 * Get all employees performance (Admin/Manager)
 */
export const getAllPerformance = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Vui lòng cung cấp tháng và năm",
                error: true,
                success: false
            });
        }

        const performances = await PerformanceModel.find({
            month: parseInt(month),
            year: parseInt(year)
        })
            .populate('employeeId', 'name email role position')
            .sort({ totalHours: -1 });

        return res.status(200).json({
            message: "Lấy dữ liệu hiệu suất tất cả nhân viên thành công",
            data: performances,
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
 * Get current user's performance
 */
export const getMyPerformance = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Vui lòng cung cấp tháng và năm",
                error: true,
                success: false
            });
        }

        const performance = await PerformanceModel.findOne({
            employeeId: req.user._id,
            month: parseInt(month),
            year: parseInt(year)
        });

        if (!performance) {
            // Return empty performance if not found
            return res.status(200).json({
                message: "Chưa có dữ liệu hiệu suất",
                data: {
                    employeeId: req.user._id,
                    month: parseInt(month),
                    year: parseInt(year),
                    totalHours: 0,
                    totalShifts: 0,
                    completedShifts: 0,
                    lateCheckIns: 0,
                    absences: 0,
                    ordersProcessed: 0,
                    dishesCooked: 0
                },
                error: false,
                success: true
            });
        }

        return res.status(200).json({
            message: "Lấy dữ liệu hiệu suất của bạn thành công",
            data: performance,
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
 * Update performance metrics (called by other controllers)
 */
export const updatePerformanceMetrics = async (employeeId, month, year, metrics) => {
    try {
        const performance = await PerformanceModel.findOneAndUpdate(
            { employeeId, month, year },
            { $inc: metrics },
            { upsert: true, new: true }
        );

        return performance;
    } catch (error) {
        console.error("Error updating performance metrics:", error);
        throw error;
    }
};

/**
 * Get performance summary for dashboard
 */
export const getPerformanceSummary = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Vui lòng cung cấp tháng và năm",
                error: true,
                success: false
            });
        }

        const performances = await PerformanceModel.find({
            month: parseInt(month),
            year: parseInt(year)
        }).populate('employeeId', 'name role');

        // Calculate summary statistics
        const summary = {
            totalEmployees: performances.length,
            totalHours: performances.reduce((sum, p) => sum + p.totalHours, 0),
            totalShifts: performances.reduce((sum, p) => sum + p.totalShifts, 0),
            totalOrders: performances.reduce((sum, p) => sum + p.ordersProcessed, 0),
            totalDishes: performances.reduce((sum, p) => sum + p.dishesCooked, 0),
            avgHoursPerEmployee: 0,
            topPerformers: []
        };

        if (summary.totalEmployees > 0) {
            summary.avgHoursPerEmployee = Math.round(summary.totalHours / summary.totalEmployees * 100) / 100;

            // Get top 5 performers by hours
            summary.topPerformers = performances
                .sort((a, b) => b.totalHours - a.totalHours)
                .slice(0, 5)
                .map(p => ({
                    name: p.employeeId.name,
                    role: p.employeeId.role,
                    totalHours: p.totalHours,
                    completedShifts: p.completedShifts
                }));
        }

        return res.status(200).json({
            message: "Lấy tổng quan hiệu suất thành công",
            data: summary,
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
    getEmployeePerformance,
    getAllPerformance,
    getMyPerformance,
    updatePerformanceMetrics,
    getPerformanceSummary
};
