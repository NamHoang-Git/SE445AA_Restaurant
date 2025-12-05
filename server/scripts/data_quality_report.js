// scripts/data_quality_report.js - Generate data quality report
import 'dotenv/config';
import connectDB from '../config/connectDB.js';
import { generateDataQualityReport } from '../utils/dataQuality.util.js';

async function main() {
    try {
        await connectDB();
        const report = await generateDataQualityReport();

        console.log('\n📄 Report Summary:');
        console.log(JSON.stringify(report, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

main();
