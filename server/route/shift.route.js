import { Router } from "express";
import auth from "../middleware/auth.js";
import { checkRole, isEmployee } from "../middleware/checkPermission.js";
import {
    createShift,
    getShiftsByDate,
    getEmployeeShifts,
    getMyShifts,
    updateShift,
    deleteShift,
    checkIn,
    checkOut
} from "../controllers/shift.controller.js";

const shiftRouter = Router();

// Create shift (Manager only)
shiftRouter.post('/create', auth, checkRole(['MANAGER']), createShift);

// Get shifts by date (Manager+)
shiftRouter.get('/date/:date', auth, checkRole(['ADMIN', 'MANAGER']), getShiftsByDate);

// Get employee's shifts (Manager+)
shiftRouter.get('/employee/:id', auth, checkRole(['ADMIN', 'MANAGER']), getEmployeeShifts);

// Get current user's shifts (All employees)
shiftRouter.get('/my-shifts', auth, isEmployee, getMyShifts);

// Update shift (Manager only)
shiftRouter.put('/update/:id', auth, checkRole(['MANAGER']), updateShift);

// Delete shift (Manager only)
shiftRouter.delete('/delete/:id', auth, checkRole(['MANAGER']), deleteShift);

// Check-in (All employees)
shiftRouter.post('/check-in', auth, isEmployee, checkIn);

// Check-out (All employees)
shiftRouter.post('/check-out', auth, isEmployee, checkOut);

export default shiftRouter;
