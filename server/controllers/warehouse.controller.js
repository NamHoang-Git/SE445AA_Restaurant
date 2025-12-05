// controllers/warehouse.controller.js - Warehouse management API
import WhImport from '../models/warehouse/whImport.model.js';

/**
 * Get all warehouse imports
 */
export async function getWarehouseImports(req, res) {
    try {
        const imports = await WhImport.find({})
            .sort({ import_date: -1 });

        res.json({
            success: true,
            data: imports,
            total: imports.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Get single warehouse import
 */
export async function getWarehouseImport(req, res) {
    try {
        const whImport = await WhImport.findById(req.params.id);

        if (!whImport) {
            return res.status(404).json({
                success: false,
                message: 'Import not found'
            });
        }

        res.json({
            success: true,
            data: whImport
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Create warehouse import
 */
export async function createWarehouseImport(req, res) {
    try {
        // Generate import_id if not provided
        if (!req.body.import_id) {
            req.body.import_id = `IMP_${Date.now()}`;
        }

        // Calculate total_cost
        if (req.body.quantity && req.body.unit_cost) {
            req.body.total_cost = req.body.quantity * req.body.unit_cost;
        }

        const whImport = await WhImport.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Warehouse import created successfully',
            data: whImport
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Update warehouse import
 */
export async function updateWarehouseImport(req, res) {
    try {
        // Recalculate total_cost if quantity or unit_cost changed
        if (req.body.quantity || req.body.unit_cost) {
            const current = await WhImport.findById(req.params.id);
            const quantity = req.body.quantity || current.quantity;
            const unit_cost = req.body.unit_cost || current.unit_cost;
            req.body.total_cost = quantity * unit_cost;
        }

        const whImport = await WhImport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!whImport) {
            return res.status(404).json({
                success: false,
                message: 'Import not found'
            });
        }

        res.json({
            success: true,
            message: 'Warehouse import updated successfully',
            data: whImport
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Delete warehouse import
 */
export async function deleteWarehouseImport(req, res) {
    try {
        const whImport = await WhImport.findByIdAndDelete(req.params.id);

        if (!whImport) {
            return res.status(404).json({
                success: false,
                message: 'Import not found'
            });
        }

        res.json({
            success: true,
            message: 'Warehouse import deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Get warehouse summary
 */
export async function getWarehouseSummary(req, res) {
    try {
        const totalImports = await WhImport.countDocuments();
        const totalValue = await WhImport.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total_cost' }
                }
            }
        ]);

        const recentImports = await WhImport.find({})
            .sort({ import_date: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                total_imports: totalImports,
                total_value: totalValue[0]?.total || 0,
                recent_imports: recentImports
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
