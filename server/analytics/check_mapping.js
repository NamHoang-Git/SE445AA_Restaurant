// analytics/check_mapping.js - Check product mapping
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function check() {
    try {
        await connectDB();
        const db = mongoose.connection.db;

        console.log('🔍 Checking Product Mapping...\n');

        // 1. Check warehouse imports
        console.log('1. Warehouse Imports:');
        const whImports = await db.collection('staging_wh_imports').find().limit(3).toArray();
        console.log(`   Total: ${await db.collection('staging_wh_imports').countDocuments()}`);
        if (whImports.length > 0) {
            console.log(`   Sample:`);
            console.log(`   - import_id: ${whImports[0].import_id}`);
            console.log(`   - product_id: ${whImports[0].product_id}`);
            console.log(`   - unit_cost: ${whImports[0].unit_cost}`);
            console.log(`   - warehouse_location: ${whImports[0].warehouse_location}`);
        }
        console.log('\n');

        // 2. Check product mapping file
        console.log('2. Product Mapping File:');
        const mappingPath = path.join(__dirname, '../config/product_mapping.json');
        if (fs.existsSync(mappingPath)) {
            const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
            console.log(`   ✅ File exists`);
            console.log(`   Mappings: ${JSON.stringify(mapping, null, 2)}`);
        } else {
            console.log(`   ❌ File not found at: ${mappingPath}`);
        }
        console.log('\n');

        // 3. Check dim_menu_items
        console.log('3. DW Menu Items:');
        const menuItems = await db.collection('dw_dim_menu_items').find().limit(3).toArray();
        console.log(`   Total: ${await db.collection('dw_dim_menu_items').countDocuments()}`);
        if (menuItems.length > 0) {
            console.log(`   Sample:`);
            menuItems.forEach(item => {
                console.log(`   - ${item.name}`);
                console.log(`     product_id: ${item.product_id}`);
                console.log(`     avg_import_cost: ${item.avg_import_cost || 'NULL'}`);
                console.log(`     warehouse_location: ${item.warehouse_location || 'NULL'}`);
            });
        }
        console.log('\n');

        // 4. Check if product_ids match
        console.log('4. Checking ID Matches:');
        const whProductIds = whImports.map(w => w.product_id);
        const menuProductIds = menuItems.map(m => m.product_id);

        console.log(`   Warehouse product_ids: ${whProductIds.join(', ')}`);
        console.log(`   Menu product_ids: ${menuProductIds.slice(0, 3).join(', ')}...`);

        const matches = whProductIds.filter(id => menuProductIds.includes(id));
        console.log(`   Matches: ${matches.length} / ${whProductIds.length}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

check();
