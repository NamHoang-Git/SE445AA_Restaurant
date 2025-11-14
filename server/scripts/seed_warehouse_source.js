import 'dotenv/config';
import { connectWarehouseDB } from '../config/connectWarehouseDB.js';
import WhProduct from '../models/warehouse-source/whProduct.source.model.js';
import WhImport from '../models/warehouse-source/whImport.source.model.js';
import WhExport from '../models/warehouse-source/whExport.source.model.js';

async function main() {
    const conn = await connectWarehouseDB();

    // Xóa sạch cho dễ thử lại
    await Promise.all([
        WhProduct.deleteMany({}),
        WhImport.deleteMany({}),
        WhExport.deleteMany({}),
    ]);

    // 1) Sản phẩm/ nguyên liệu kho (map với product_id P001..P003 bên nhà hàng)
    const products = await WhProduct.insertMany([
        { product_code: 'P001', name: 'Cafe Sua', unit: 'ly' },
        { product_code: 'P002', name: 'Banh Mi Thit', unit: 'ổ' },
        { product_code: 'P003', name: 'Tra Dao', unit: 'ly' },
    ]);

    console.log(`✅ Seed wh_products: ${products.length}`);

    // 2) Phiếu nhập kho
    const imports = await WhImport.insertMany([
        {
            import_code: 'I1001',
            product_code: 'P001',
            quantity: 100,
            unit_cost: 12000,
            import_date: new Date('2025-10-30T09:00:00Z'),
            supplier: 'NCC Cafe A',
        },
        {
            import_code: 'I1002',
            product_code: 'P002',
            quantity: 80,
            unit_cost: 20000,
            import_date: new Date('2025-10-30T10:00:00Z'),
            supplier: 'NCC Banh Mi B',
        },
        {
            import_code: 'I1003',
            product_code: 'P003',
            quantity: 120,
            unit_cost: 10000,
            import_date: new Date('2025-10-31T11:00:00Z'),
            supplier: 'NCC Tra C',
        },
    ]);

    console.log(`✅ Seed wh_imports: ${imports.length}`);

    // 3) Phiếu xuất kho (giả sử liên quan đến bán hàng/hao hụt)
    const exports = await WhExport.insertMany([
        {
            export_code: 'E2001',
            product_code: 'P001',
            quantity: 20,
            reason: 'SALE',
            export_date: new Date('2025-11-01T09:10:00Z'),
        },
        {
            export_code: 'E2002',
            product_code: 'P001',
            quantity: 5,
            reason: 'WASTE',
            export_date: new Date('2025-11-01T18:00:00Z'),
        },
        {
            export_code: 'E2003',
            product_code: 'P002',
            quantity: 15,
            reason: 'SALE',
            export_date: new Date('2025-11-02T11:50:00Z'),
        },
    ]);

    console.log(`✅ Seed wh_exports: ${exports.length}`);

    await conn.close();
    console.log('🎉 Seed warehouse source done!');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seed warehouse error:', err);
    process.exit(1);
});
