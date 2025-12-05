import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load product mapping
let productMapping = {};
try {
    const mappingPath = path.join(__dirname, '../config/product_mapping.json');
    const mappingData = fs.readFileSync(mappingPath, 'utf8');
    productMapping = JSON.parse(mappingData);
} catch (err) {
    console.warn('⚠️ Could not load product_mapping.json:', err.message);
}

export class MenuItemTransformStrategy {
    /**
     * Transform staging products and merge with warehouse data
     * @param {Array} stagingProducts - Products from restaurant system
     * @param {Array} stagingWhImports - Warehouse imports (optional)
     * @returns {Array} Transformed menu items for DW
     */
    transform(stagingProducts = [], stagingWhImports = []) {
        const byProduct = new Map();

        // 1. Process restaurant products first
        for (const p of stagingProducts) {
            if (!p.product_id) continue;

            byProduct.set(p.product_id, {
                product_id: p.product_id,
                name: p.name,
                price: p.price,
                discount: p.discount,
                publish: p.publish,
                category_ids: p.category_ids,
                sub_category_id: p.sub_category_id,
                slug: p.slug,
                created_at: p.created_at,
                // Initialize warehouse fields
                avg_import_cost: null,
                warehouse_location: null,
            });
        }

        // 2. Merge warehouse data if available
        if (stagingWhImports && stagingWhImports.length > 0) {
            // Group warehouse imports by product_id to calculate average cost
            const whByProduct = new Map();

            for (const wh of stagingWhImports) {
                const warehouseProductId = wh.product_id;

                // Try two approaches:
                // 1. Direct match (for CS445K products with MongoDB ObjectId)
                // 2. Mapping (for old products with custom IDs like P001, RICE01)

                let targetProductId = null;

                // Approach 1: Direct match
                if (byProduct.has(warehouseProductId)) {
                    targetProductId = warehouseProductId;
                }
                // Approach 2: Use mapping
                else if (productMapping[warehouseProductId]) {
                    targetProductId = productMapping[warehouseProductId];
                }

                if (!targetProductId) {
                    console.warn(`⚠️  No match found for warehouse product: ${warehouseProductId}`);
                    continue;
                }

                if (!whByProduct.has(targetProductId)) {
                    whByProduct.set(targetProductId, []);
                }
                whByProduct.get(targetProductId).push(wh);
            }

            // Merge warehouse data into products
            for (const [productId, whRecords] of whByProduct.entries()) {
                const product = byProduct.get(productId);
                if (!product) continue;

                // Calculate average import cost
                const totalCost = whRecords.reduce((sum, wh) => sum + (wh.unit_cost || 0), 0);
                product.avg_import_cost = whRecords.length > 0 ? totalCost / whRecords.length : null;

                // Use the most recent warehouse location
                const sortedWh = whRecords.sort((a, b) =>
                    new Date(b.import_date) - new Date(a.import_date)
                );
                product.warehouse_location = sortedWh[0]?.warehouse_location || null;
            }
        }

        return [...byProduct.values()];
    }
}
