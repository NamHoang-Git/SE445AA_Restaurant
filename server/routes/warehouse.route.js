// routes/warehouse.route.js - Warehouse API routes
import express from 'express';
import {
    getWarehouseImports,
    getWarehouseImport,
    createWarehouseImport,
    updateWarehouseImport,
    deleteWarehouseImport,
    getWarehouseSummary
} from '../controllers/warehouse.controller.js';

const router = express.Router();

// Summary
router.get('/summary', getWarehouseSummary);

// CRUD for imports
router.get('/imports', getWarehouseImports);
router.get('/imports/:id', getWarehouseImport);
router.post('/imports', createWarehouseImport);
router.put('/imports/:id', updateWarehouseImport);
router.delete('/imports/:id', deleteWarehouseImport);

export default router;
