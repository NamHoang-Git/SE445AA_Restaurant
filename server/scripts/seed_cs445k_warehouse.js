// scripts/seed_cs445k_warehouse.js - Seed warehouse data for CS445K products
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import StagingWhImport from '../models/staging/stagingWhImport.model.js';

const cs445kWarehouseData = [
    {
        import_id: 'IMP_CS001',
        product_id: 'RICE01',  // Will map to 691f50b4e100f9644c70b670
        product_name_raw: 'RICE NEW',
        quantity: 200,
        unit_cost: 35000,  // 35k import, sell 50M (test price, will adjust)
        import_date: new Date('2025-11-01'),
        supplier: 'Rice Supplier A',
        warehouse_location: 'WH-MAIN'
    },
    {
        import_id: 'IMP_CS002',
        product_id: 'NEW01',   // Will map to 691f5e99e100f9644c70b7a4
        product_name_raw: 'NEWNEW PRODUCT',
        quantity: 150,
        unit_cost: 250000,  // 250k import, sell 500k
        import_date: new Date('2025-11-05'),
        supplier: 'General Supplier B',
        warehouse_location: 'WH-MAIN'
    },
    {
        import_id: 'IMP_CS003',
        product_id: 'DRINK01',  // Will map to 6925d8d62c2ec8a4cac67d6a
        product_name_raw: 'DO UONG HIHI',
        quantity: 100,
        unit_cost: 200000,  // 200k import, sell 500k
        import_date: new Date('2025-11-10'),
        supplier: 'Beverage Supplier C',
        warehouse_location: 'WH-DRINK'
    },
    {
        import_id: 'IMP_CS004',
        product_id: 'VEG01',   // Will map to 692afd6e83b2eb5b04e6e2fe
        product_name_raw: 'CABBAGE ORGANIC',
        quantity: 50,
        unit_cost: 300000,  // 300k import, sell 500k
        import_date: new Date('2025-11-15'),
        supplier: 'Organic Farm D',
        warehouse_location: 'WH-FRESH'
    }
];

async function seedCS445KWarehouse() {
    try {
        await connectDB();
        console.log('🌱 Seeding CS445K Warehouse Data...\n');

        // Clear existing CS445K warehouse data
        await StagingWhImport.deleteMany({
            import_id: { $regex: /^IMP_CS/ }
        });
        console.log('✅ Cleared old CS445K warehouse data\n');

        // Insert new data
        const result = await StagingWhImport.insertMany(cs445kWarehouseData);
        console.log(`✅ Inserted ${result.length} warehouse records\n`);

        // Display inserted data
        result.forEach((item, i) => {
            console.log(`${i + 1}. ${item.product_name_raw}`);
            console.log(`   Item Code: ${item.product_id}`);
            console.log(`   Cost: ${item.unit_cost.toLocaleString()} VND`);
            console.log(`   Location: ${item.warehouse_location}`);
            console.log('');
        });

        console.log('✅ CS445K Warehouse data seeded successfully!');
        console.log('\n📝 Next step: Update product_mapping.json with:');
        console.log(JSON.stringify({
            'RICE01': '691f50b4e100f9644c70b670',
            'NEW01': '691f5e99e100f9644c70b7a4',
            'DRINK01': '6925d8d62c2ec8a4cac67d6a',
            'VEG01': '692afd6e83b2eb5b04e6e2fe'
        }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seedCS445KWarehouse();
