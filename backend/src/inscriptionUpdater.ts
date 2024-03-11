// backend/src/inscriptionupdater.ts

import { Pool } from 'pg';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';
import { Inscription } from '../util/types';

// Setup database connection
const pool = new Pool({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine, 'postgres' if within Docker
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});

let shutdownRequested = false;

process.on('SIGINT', () => {
    console.log('Shutdown signal received. Finishing current block before shutting down...');
    shutdownRequested = true;
});

process.on('SIGTERM', () => {
    console.log('Shutdown signal received. Finishing current block before shutting down...');
    shutdownRequested = true;
});

async function getLastProcessedBlock(): Promise<number> {
    try {
        const res = await pool.query('SELECT MAX(genesis_height) as last_processed_block FROM inscriptions');
        return res.rows[0].last_processed_block ? parseInt(res.rows[0].last_processed_block, 10) : 2400000; // Default to 2400000 or an appropriate starting block
    } catch (error) {
        console.error('Error fetching last processed block:', error);
        throw error;
    }
}

async function updateLastProcessedBlock(blockNumber: number, pageIndex: number): Promise<void> {
    try {
        // Upsert query: inserts or updates the last processed block and page
        await pool.query(`
            INSERT INTO update_progress (progress_key, last_processed_block, last_processed_page)
            VALUES ('last_processed_block', $1, $2)
            ON CONFLICT (progress_key) DO UPDATE
            SET last_processed_block = EXCLUDED.last_processed_block,
                last_processed_page = EXCLUDED.last_processed_page`,
            [blockNumber, pageIndex]
        );
        // console.log(`Updated progress to block ${blockNumber}, page ${pageIndex}`);
    } catch (error) {
        console.error('Error updating last processed block and page:', error);
        throw error;
    }
}


async function storeInscriptionsBatch(inscriptionsData: Inscription[]) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertPromises = inscriptionsData.map(inscription => {
            const { inscription_id, address, content_length, content_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestamp, charms, children } = inscription;
            const content_type_type = content_type.split('/')[0]; // Extract the "type" from "type/subtype"
            const timestampIso = new Date(parseInt(timestamp) * 1000).toISOString();
            return client.query(`
                INSERT INTO inscriptions (inscription_id, address, content_length, content_type, content_type_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestamp, charms, children)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                ON CONFLICT (inscription_id) DO NOTHING`, 
                [inscription_id, address, content_length, content_type, content_type_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestampIso, charms, children]
            );
        });
        await Promise.all(insertPromises);
        await client.query('COMMIT');
    } catch (error) {
        console.error('Error in batch storing inscriptions:', error);
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


async function updateInscriptions(): Promise<void> {
    console.log('Starting the update process.');
    const lastProcessedBlock = await getLastProcessedBlock();
    const currentHeight = await getBlockHeight();
    console.log('Current height: ', currentHeight)
    const CONFIRMATIONS_REQUIRED = 2;
    const safeHeight = currentHeight - CONFIRMATIONS_REQUIRED;
    console.log('Safe height: ', safeHeight)

    for (let blockNumber = lastProcessedBlock + 1; blockNumber <= safeHeight && !shutdownRequested; blockNumber++) {
        let pageNumber = 0;
        let more = true;

        while (more && !shutdownRequested) {
            const { inscriptions, more: morePages } = await getBlockInscriptionsPage(blockNumber, pageNumber);
            const inscriptionsData = [];

            for (const inscriptionId of inscriptions) {
                console.log('inscriptionId: ', inscriptionId)
                try {
                    console.log('Get inscription: ', inscriptionId)
                    const inscriptionData = await getInscriptionData(inscriptionId);
                    console.log('Got inscription: ', inscriptionData.inscription_number)
                    inscriptionsData.push(inscriptionData);
                } catch (error) {
                    console.error(`Error fetching inscription ${inscriptionId}:`, error);
                }
            }

            if (inscriptionsData.length > 0) {
                await storeInscriptionsBatch(inscriptionsData);
            }

            console.log(`Block: ${blockNumber} - Page: ${pageNumber}`);

            more = morePages;
            pageNumber++;
        }

        await updateLastProcessedBlock(blockNumber, pageNumber - 1);
        console.log('Updated Inscriptions Table \n')

        if (shutdownRequested) {
            console.log('Shutdown requested, finishing up...');
            break;
        }
    }
}



let iterationCounter = 0; // Initialize the counter

function checkForNewBlockAndUpdateViews() {
    iterationCounter++; // Increment the counter each time the function is called
    let currentTime = new Date(); // Get the current time
    console.log(`Iteration ${iterationCounter} at ${currentTime.toISOString()}: Checking for new block and updating views.`);
    updateInscriptions().catch(error => console.error('Error in update process:', error));
    currentTime = new Date(); // Get the current time
    console.log(`Iteation ${iterationCounter} at ${currentTime.toISOString()}`)
}

const REFRESH_INTERVAL = 30000; // 30 seconds in milliseconds

// Setup graceful shutdown
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    pool.end().then(() => {
        console.log('Pool has ended');
        process.exit(0);
    }).catch((error) => {
        console.error('Error during pool shutdown:', error);
        process.exit(1);
    });
});

// Optionally handle SIGTERM as well
process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down from SIGTERM...');
    pool.end().then(() => {
        console.log('Pool has ended');
        process.exit(0);
    }).catch((error) => {
        console.error('Error during pool shutdown:', error);
        process.exit(1);
    });
});

setInterval(checkForNewBlockAndUpdateViews, REFRESH_INTERVAL);

checkForNewBlockAndUpdateViews();
