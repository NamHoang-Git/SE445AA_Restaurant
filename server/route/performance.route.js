import { Router } from "express";
import auth from "../middleware/auth.js";
import { isManagement, isEmployee } from "../middleware/checkPermission.js";
import {
    getEmployeePerformance,
    getAllPerformance,
    getMyPerformance,
    getPerformanceSummary
} from "../controllers/performance.controller.js";

const performanceRouter = Router();

// Get employee performance (Manager+)
performanceRouter.get('/employee/:id', auth, isManagement, getEmployeePerformance);

// Get all employees performance (Manager+)
performanceRouter.get('/all', auth, isManagement, getAllPerformance);

// Get current user's performance (All employees)
performanceRouter.get('/my-performance', auth, isEmployee, getMyPerformance);

// Get performance summary for dashboard (Manager+)
performanceRouter.get('/summary', auth, isManagement, getPerformanceSummary);

export default performanceRouter;
