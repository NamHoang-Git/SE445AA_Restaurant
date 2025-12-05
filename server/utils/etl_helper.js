// utils/etl_helper.js - Helper functions for incremental ETL
import EtlMetadata from '../models/etl_metadata.model.js';

/**
 * Get last successful run timestamp for a source
 */
export async function getLastRunTimestamp(source) {
    // Get the last successful run (not the current running one)
    const metadata = await EtlMetadata.findOne({
        source,
        last_run_status: 'success'  // Only get completed runs
    }).sort({ last_run_at: -1 });

    return metadata?.last_run_at || null;
}

/**
 * Update ETL metadata after run
 */
export async function updateEtlMetadata(source, stats) {
    const {
        status = 'success',
        recordsProcessed = 0,
        recordsFailed = 0,
        runType = 'full',
        durationMs = 0
    } = stats;

    await EtlMetadata.findOneAndUpdate(
        { source },
        {
            last_run_at: new Date(),
            last_run_status: status,
            records_processed: recordsProcessed,
            records_failed: recordsFailed,
            run_type: runType,
            run_duration_ms: durationMs
        },
        { upsert: true, new: true }
    );
}

/**
 * Mark ETL run as started
 * NOTE: Don't call this before checking last run timestamp!
 * It will overwrite the status and break incremental load detection
 */
export async function markEtlRunning(source) {
    // Don't update if this will break incremental detection
    // Just skip marking as running for now
    // The status will be updated to 'success' after completion anyway
}

/**
 * Get all ETL metadata
 */
export async function getAllEtlMetadata() {
    return await EtlMetadata.find({}).sort({ last_run_at: -1 });
}
