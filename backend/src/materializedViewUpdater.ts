// backend/src/materializedViewUpdater.ts
import { Pool } from 'pg';
import { getBlockHeight } from '../util/ord-litecoin';

const pool = new Pool({
    user: 'ord_lite_user',
    password: 'ord_lite_pass',
    host: 'localhost',
    port: 5432,
    database: 'ord_lite_db',
});

const REFRESH_INTERVAL = 120000; // Default to 6000 seconds

async function refreshMaterializedView(viewName: string, concurrently: boolean = true): Promise<void> {
    try {
        console.log(`Refreshing materialized view: ${viewName}`);
        const startTime = Date.now();
        const refreshQuery = concurrently && viewName !== 'total_content_length' && viewName !== 'total_genesis_fee' && viewName !== 'total_inscriptions'
            ? `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`
            : `REFRESH MATERIALIZED VIEW ${viewName}`;
        await pool.query(refreshQuery);


        const endTime = Date.now();
        // Calculate the total time difference in seconds
        const totalTimeInSeconds = (endTime - startTime) / 1000;

        // Calculate minutes and seconds from totalTimeInSeconds
        const minutes = Math.floor(totalTimeInSeconds / 60);
        const seconds = Math.round(totalTimeInSeconds % 60);

        console.log(`Successfully refreshed ${viewName} in ${minutes} min ${seconds} seconds.`);

    } catch (error) {
        console.error(`Error refreshing materialized view ${viewName}:`, error);
        throw error; // Rethrow to handle retries or other logic outside
    }
}


async function updateMaterializedViews() {
    const views = [
        'inscriptions_image',
        'inscriptions_model',
        'inscriptions_text',
        'inscriptions_video',
        'inscriptions_audio',
        'inscriptions_application',
        'total_content_length',
        'total_genesis_fee',
        'total_inscriptions',
    ];

    for (const view of views) {
        try {
            await refreshMaterializedView(view);
        } catch (error) {
            console.error(`Failed to refresh view ${view}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            try {
                await refreshMaterializedView(view); // Retry once
            } catch (retryError) {
                console.error(`Failed to refresh view ${view} after retry:`, retryError);
            }
        }
    }
}

let lastKnownBlockHeight = 0;

async function checkForNewBlockAndUpdateViews() {
    try {
        const currentBlockHeight = await getBlockHeight();
        console.log(`\nChecking for new block... Current height: ${currentBlockHeight}, Last known height: ${lastKnownBlockHeight}`);

        if (currentBlockHeight > lastKnownBlockHeight) {
            console.log(`New block found: ${currentBlockHeight}. Updating materialized views...`);
            await updateMaterializedViews();
            lastKnownBlockHeight = currentBlockHeight;
        } else {
            console.log('No new block found or block height has not changed.');
        }
    } catch (error) {
        console.error('Error checking for new block:', error);
    }
}

// Setup graceful shutdown
process.on('SIGINT', () => {
    console.log('/n Gracefully shutting down...');
    pool.end(() => {
        console.log('Pool has ended');
        process.exit(0);
    });
});

// Run the check every REFRESH_INTERVAL milliseconds
setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL);

// Initial check
checkForNewBlockAndUpdateViews();
