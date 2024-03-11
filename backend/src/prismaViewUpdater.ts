// backend/src/prismaViewUpdater.ts
import { Pool } from 'pg';
import { getBlockHeight } from '../util/ord-litecoin';

const pool = new Pool({
    user: 'ord_lite_user',
    password: 'ord_lite_pass',
    host: 'localhost',
    port: 5432,
    database: 'ord_lite_db',
});



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
        'mv_inscriptions_video',
        'mv_inscriptions_audio',
    ];

    let toUpdateViews = [...views]; // Assuming views is an array of strings

    while (toUpdateViews.length > 0) {
        const view = toUpdateViews.shift(); // This can return string | undefined
        if (view !== undefined) { // Check that view is not undefined
            try {
                await refreshMaterializedView(view);
                console.log(`Successfully updated ${view}.`);
            } catch (error) {
                console.error(`Failed to refresh view ${view}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
                toUpdateViews.push(view); // Add back for a retry, now guaranteed to be a string
            }
        }
    }
}


let lastKnownBlockHeight = 0;
let updateInProgress = false;

async function checkForNewBlockAndUpdateViews() {
    try {
        const currentBlockHeight = await getBlockHeight();
        console.log(`\nChecking for new block... Current height: ${currentBlockHeight}, Last known height: ${lastKnownBlockHeight}`);

        if (currentBlockHeight > lastKnownBlockHeight && !updateInProgress) {
            console.log(`New block found: ${currentBlockHeight}. Updating materialized views...`);
            updateInProgress = true; // Set flag to true to indicate the update process has started
            await updateMaterializedViews();
            lastKnownBlockHeight = currentBlockHeight;
            updateInProgress = false; // Reset flag after updates are complete
        } else {
            if(updateInProgress) {
                console.log('Update already in progress. Skipping this cycle.');
            } else {
                console.log('No new block found or block height has not changed.');
            }
        }
    } catch (error) {
        console.error('Error checking for new block:', error);
        updateInProgress = false; // Ensure to reset flag in case of error
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
const REFRESH_INTERVAL = 120000; // Default to 6000 seconds
// Run the check every REFRESH_INTERVAL milliseconds
setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL);

// Initial check
checkForNewBlockAndUpdateViews();
