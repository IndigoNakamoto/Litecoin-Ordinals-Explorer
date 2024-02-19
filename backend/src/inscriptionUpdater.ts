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
            const timestampIso = new Date(parseInt(timestamp) * 1000).toISOString();
            return client.query(`
                INSERT INTO inscriptions (inscription_id, address, content_length, content_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestamp, charms, children)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                ON CONFLICT (inscription_id) DO NOTHING`, 
                [inscription_id, address, content_length, content_type, genesis_fee, genesis_height, inscription_number, next, output_value, parent, previous, rune, sat, satpoint, timestampIso, charms, children]
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

async function updateInscriptions() {
    // Adjusted to collect inscriptions and use batch saving
    console.log('Starting the update process.');

    const lastProcessedBlock = await getLastProcessedBlock();
    const currentHeight = await getBlockHeight();
    const CONFIRMATIONS_REQUIRED = 2;
    const safeHeight = currentHeight - CONFIRMATIONS_REQUIRED;

    for (let blockNumber = lastProcessedBlock + 1; blockNumber <= safeHeight; blockNumber++) {
        let pageNumber = 0;
        let more = true;

        

        while (more) {
            const { inscriptions, more: morePages } = await getBlockInscriptionsPage(blockNumber, pageNumber);
            const inscriptionsData = [];

            for (const inscriptionId of inscriptions) {
                try {
                    const inscriptionData = await getInscriptionData(inscriptionId);
                    inscriptionsData.push(inscriptionData);
                    // console.log('Store inscription #', inscriptionData.inscription_number)
                } catch (error) {
                    console.error(`Error fetching inscription ${inscriptionId}:`, error);
                }
            }

            if (inscriptionsData.length > 0) {
                // console.log(`${inscriptionsData.length} inscriptions to be stored.`)
                await storeInscriptionsBatch(inscriptionsData);
            }
            console.log(`Block: ${blockNumber} - Page: ${pageNumber}`)

            more = morePages;
            pageNumber++;
        }

        await updateLastProcessedBlock(blockNumber, pageNumber - 1);
    }

    console.log('Finished processing new blocks.');
    setTimeout(updateInscriptions, 15000);
}



// Start the update process
updateInscriptions().catch(error => console.error('Error in update process:', error));
