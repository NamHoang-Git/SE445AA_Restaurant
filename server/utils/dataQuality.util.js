// utils/dataQuality.util.js - Data quality analysis and scoring
import StagingUser from '../models/staging/stagingUser.model.js';
import StagingProduct from '../models/staging/stagingProduct.model.js';
import StagingOrderItem from '../models/staging/stagingOrderItem.model.js';
import StagingError from '../models/staging/stagingError.model.js';

/**
 * Calculate completeness score for a collection
 */
export async function calculateCompleteness(Model, requiredFields) {
    const total = await Model.countDocuments();
    if (total === 0) return 100;

    let completeCount = 0;
    const records = await Model.find({}).lean();

    for (const record of records) {
        const isComplete = requiredFields.every(field => {
            const value = record[field];
            return value !== null && value !== undefined && value !== '';
        });
        if (isComplete) completeCount++;
    }

    return (completeCount / total * 100).toFixed(2);
}

/**
 * Detect duplicates in a collection
 */
export async function detectDuplicates(Model, uniqueFields) {
    const pipeline = [
        {
            $group: {
                _id: uniqueFields.reduce((acc, field) => {
                    acc[field] = `$${field}`;
                    return acc;
                }, {}),
                count: { $sum: 1 },
                ids: { $push: '$_id' }
            }
        },
        {
            $match: { count: { $gt: 1 } }
        }
    ];

    const duplicates = await Model.aggregate(pipeline);
    return {
        count: duplicates.length,
        total_duplicate_records: duplicates.reduce((sum, d) => sum + d.count, 0),
        duplicates: duplicates.slice(0, 10) // Return first 10 for review
    };
}

/**
 * Calculate accuracy score based on validation errors
 */
export async function calculateAccuracy() {
    const totalRecords =
        await StagingUser.countDocuments() +
        await StagingProduct.countDocuments() +
        await StagingOrderItem.countDocuments();

    const totalErrors = await StagingError.countDocuments();

    if (totalRecords === 0) return 100;

    const accuracy = ((totalRecords - totalErrors) / totalRecords * 100).toFixed(2);
    return parseFloat(accuracy);
}

/**
 * Calculate consistency score (duplicate detection)
 */
export async function calculateConsistency() {
    // Check duplicates in users (by email)
    const userDuplicates = await detectDuplicates(StagingUser, ['email']);
    const totalUsers = await StagingUser.countDocuments();

    // Check duplicates in products (by product_id)
    const productDuplicates = await detectDuplicates(StagingProduct, ['product_id']);
    const totalProducts = await StagingProduct.countDocuments();

    const totalRecords = totalUsers + totalProducts;
    const totalDuplicates = userDuplicates.total_duplicate_records + productDuplicates.total_duplicate_records;

    if (totalRecords === 0) return 100;

    const consistency = ((totalRecords - totalDuplicates) / totalRecords * 100).toFixed(2);
    return {
        score: parseFloat(consistency),
        user_duplicates: userDuplicates.count,
        product_duplicates: productDuplicates.count
    };
}

/**
 * Calculate timeliness score (data freshness)
 */
export async function calculateTimeliness() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentUsers = await StagingUser.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const totalUsers = await StagingUser.countDocuments();

    if (totalUsers === 0) return 100;

    const timeliness = (recentUsers / totalUsers * 100).toFixed(2);
    return parseFloat(timeliness);
}

/**
 * Generate comprehensive data quality report
 */
export async function generateDataQualityReport() {
    console.log('📊 Generating Data Quality Report...\n');

    // 1. Completeness
    console.log('1. COMPLETENESS ANALYSIS');
    const userCompleteness = await calculateCompleteness(StagingUser, ['customer_id', 'name', 'email']);
    const productCompleteness = await calculateCompleteness(StagingProduct, ['product_id', 'name', 'price']);
    const orderCompleteness = await calculateCompleteness(StagingOrderItem, ['order_id', 'customer_id', 'product_id']);

    console.log(`   Users: ${userCompleteness}%`);
    console.log(`   Products: ${productCompleteness}%`);
    console.log(`   Orders: ${orderCompleteness}%`);
    const avgCompleteness = ((parseFloat(userCompleteness) + parseFloat(productCompleteness) + parseFloat(orderCompleteness)) / 3).toFixed(2);
    console.log(`   Average: ${avgCompleteness}%\n`);

    // 2. Accuracy
    console.log('2. ACCURACY ANALYSIS');
    const accuracy = await calculateAccuracy();
    console.log(`   Accuracy: ${accuracy}%\n`);

    // 3. Consistency
    console.log('3. CONSISTENCY ANALYSIS');
    const consistency = await calculateConsistency();
    console.log(`   Consistency: ${consistency.score}%`);
    console.log(`   User Duplicates: ${consistency.user_duplicates}`);
    console.log(`   Product Duplicates: ${consistency.product_duplicates}\n`);

    // 4. Timeliness
    console.log('4. TIMELINESS ANALYSIS');
    const timeliness = await calculateTimeliness();
    console.log(`   Timeliness: ${timeliness}%\n`);

    // 5. Overall Quality Score
    const overallScore = (
        (parseFloat(avgCompleteness) * 0.3) +
        (accuracy * 0.3) +
        (consistency.score * 0.2) +
        (timeliness * 0.2)
    ).toFixed(2);

    console.log('═'.repeat(60));
    console.log(`OVERALL DATA QUALITY SCORE: ${overallScore}%`);
    console.log('═'.repeat(60));

    let grade = 'Poor';
    if (overallScore >= 90) grade = 'Excellent';
    else if (overallScore >= 80) grade = 'Good';
    else if (overallScore >= 70) grade = 'Fair';

    console.log(`Grade: ${grade}\n`);

    return {
        completeness: {
            users: parseFloat(userCompleteness),
            products: parseFloat(productCompleteness),
            orders: parseFloat(orderCompleteness),
            average: parseFloat(avgCompleteness)
        },
        accuracy,
        consistency: {
            score: consistency.score,
            user_duplicates: consistency.user_duplicates,
            product_duplicates: consistency.product_duplicates
        },
        timeliness,
        overall_score: parseFloat(overallScore),
        grade
    };
}

/**
 * Profile data - analyze patterns and distributions
 */
export async function profileData(Model, field) {
    const pipeline = [
        {
            $group: {
                _id: `$${field}`,
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ];

    const distribution = await Model.aggregate(pipeline);
    return distribution;
}
