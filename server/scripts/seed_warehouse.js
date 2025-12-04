// scripts/seed_warehouse.js
import 'dotenv/config';
import { connectWarehouseDB } from '../config/connectWarehouseDB.js';
import WhImport from '../models/warehouse-source/whImport.source.model.js';

async function main() {
    try {
        await connectWarehouseDB();
        console.log('🔗 Connected to Warehouse DB');

        // Clear existing data
        await WhImport.deleteMany({});
        console.log('🗑️  Cleared existing warehouse imports');

        // Seed data with different schema from restaurant
        const imports = [
            {
                import_code: 'IMP001',
                item_code: 'CF01',  // Maps to P001 in restaurant
                product_name_raw: 'CA PHE SUA',  // Uppercase, not cleaned
                quantity: 100,
                unit_cost: 12000,
                import_date: new Date('2025-10-01'),
                supplier: 'Supplier A',
                warehouse_location: 'WH-A',
            },
            {
                import_code: 'IMP002',
                item_code: 'TS02',  // Maps to P002
                product_name_raw: 'TRA SUA TRAN CHAU',
                quantity: 50,
                unit_cost: 15000,
                import_date: new Date('2025-10-02'),
                supplier: 'Supplier B',
                warehouse_location: 'WH-B',
            },
            {
                import_code: 'IMP003',
                item_code: 'BM03',  // Maps to P003
                product_name_raw: 'BANH MI THIT',
                quantity: 80,
                unit_cost: 8000,
                import_date: new Date('2025-10-03'),
                supplier: 'Supplier A',
                warehouse_location: 'WH-A',
            },
            {
                import_code: 'IMP004',
                item_code: 'CT04',  // Maps to P004
                product_name_raw: 'COM TAM SUON',
                quantity: 60,
                unit_cost: 20000,
                import_date: new Date('2025-10-04'),
                supplier: 'Supplier C',
                warehouse_location: 'WH-C',
            },
            {
                import_code: 'IMP005',
                item_code: 'PHO05',  // Maps to P005
                product_name_raw: 'PHO BO TAI',
                quantity: 70,
                unit_cost: 25000,
                import_date: new Date('2025-10-05'),
                supplier: 'Supplier B',
                warehouse_location: 'WH-B',
            },
            {
                import_code: 'IMP006',
                item_code: 'BUN06',  // Maps to P006
                product_name_raw: 'BUN CHA HA NOI',
                quantity: 90,
                unit_cost: 18000,
                import_date: new Date('2025-10-06'),
                supplier: 'Supplier A',
                warehouse_location: 'WH-A',
            },
        ];

        const inserted = await WhImport.insertMany(imports);
        console.log(`✅ Seeded ${inserted.length} warehouse imports`);

        console.log('\n📦 Warehouse Data Summary:');
        inserted.forEach(item => {
            console.log(`  - ${item.item_code}: ${item.product_name_raw} (${item.warehouse_location})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('🚨 Error seeding warehouse:', err);
        process.exit(1);
    }
}

main();
