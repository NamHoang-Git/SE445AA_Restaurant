// routes/products.route.js - API to fetch CS445K products
import express from 'express';
import connectCS445KDB from '../config/connectCS445KDB.js';
import CS445KProduct from '../models/cs445k-source/product.source.model.js';

const router = express.Router();

/**
 * GET /api/products
 * Fetch all published products from CS445K database
 */
router.get('/', async (req, res) => {
    try {
        // Connect to CS445K database
        await connectCS445KDB();

        // Fetch published products
        const products = await CS445KProduct.find({ publish: true })
            .select('_id name price category_ids image')
            .sort({ name: 1 })
            .lean();

        return res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách sản phẩm',
            error: error.message
        });
    }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        await connectCS445KDB();

        const product = await CS445KProduct.findById(req.params.id)
            .select('_id name price category_ids image')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        return res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin sản phẩm',
            error: error.message
        });
    }
});

export default router;
