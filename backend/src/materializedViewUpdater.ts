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

async function updateMaterializedViews() {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY inscriptions_images_all');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY inscriptions_images_svg');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY inscriptions_html');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY inscriptions_video');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY inscriptions_audio');
    await pool.query('REFRESH MATERIALIZED VIEW total_content_length')
    await pool.query('REFRESH MATERIALIZED VIEW total_genesis_fee')
    await pool.query('REFRESH MATERIALIZED VIEW total_inscriptions')
    // Get the current date and time
    const now = new Date();
    // Format the date and time as a string
    const timestamp = now.toLocaleString(); // This will format the date and time based on the local setting of the server
    
    console.log(`[${timestamp}] Materialized views refreshed successfully`);
  } catch (error) {
    console.error('Error refreshing materialized views:', error);
  }
}

let lastKnownBlockHeight = 0;

async function checkForNewBlockAndUpdateViews() {
    try {
      const currentBlockHeight = await getBlockHeight();
    //   console.log(`Checking for new block... Current height: ${currentBlockHeight}, Last known height: ${lastKnownBlockHeight}`);
      
      if (currentBlockHeight > lastKnownBlockHeight) {
        // console.log(`New block found: ${currentBlockHeight}. Updating materialized views...`);
        await updateMaterializedViews();
        lastKnownBlockHeight = currentBlockHeight; // Ensure this is updated after successful view refresh
      } else {
        // console.log('No new block found or block height has not changed.');
      }
    } catch (error) {
      console.error('Error checking for new block:', error);
    }
  }
  

// Run the check every 30 seconds
setInterval(checkForNewBlockAndUpdateViews, 60000);

// Initial check
checkForNewBlockAndUpdateViews();
