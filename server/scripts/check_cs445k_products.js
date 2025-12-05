// scripts/check_cs445k_products.js
import 'dotenv/config';
import CS445KProduct from '../models/cs445k-source/product.source.model.js';

async function checkProducts() {
    try {
        console.log('📊 Checking CS445K Products...\n');

        const products = await CS445KProduct.find({}).limit(10).lean();

        console.log(`Total products found: ${products.length}\n`);

        products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   ID: ${p._id}`);
            console.log(`   Price: ${p.price || 'N/A'}`);
            console.log(`   Category: ${p.category || 'N/A'}`);
            console.log('');
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkProducts();
