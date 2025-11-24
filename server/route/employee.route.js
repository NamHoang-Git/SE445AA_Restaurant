import { Router } from "express";
import auth from "../middleware/auth.js";
import { checkPermission, isManagement } from "../middleware/checkPermission.js";
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByRole
} from "../controllers/employee.controller.js";

const employeeRouter = Router();

// Get all employees (Manager+)
employeeRouter.get('/all', auth, isManagement, getAllEmployees);

// Get employee by ID (Manager+)
employeeRouter.get('/:id', auth, isManagement, getEmployeeById);

// Create new employee (Manager+)
employeeRouter.post('/create', auth, isManagement, createEmployee);

// Update employee (Manager+)
employeeRouter.put('/update/:id', auth, isManagement, updateEmployee);

// Delete employee (Admin only)
employeeRouter.delete('/delete/:id', auth, checkPermission('employee:delete'), deleteEmployee);

// Get employees by role (Manager+)
employeeRouter.get('/role/:role', auth, isManagement, getEmployeesByRole);

export default employeeRouter;
