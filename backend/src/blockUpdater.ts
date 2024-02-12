//backend/src/blockUpdater.ts
import { Pool, PoolClient } from 'pg';
import { getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';

const POSTGRES_USER = 'your_username'; // Replace 'your_username' with the actual username
const POSTGRES_PASSWORD = 'your_password'; // Replace 'your_password' with the actual password
const POSTGRES_DB = 'ordinals';
const POSTGRES_HOST = 'localhost'; // Use 'postgres' if running from another service within the same Docker Compose network
const POSTGRES_PORT = 5432; // Default PostgreSQL port

const pool = new Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DB,
    // Add SSL configuration if necessary, for example in production environments
    // ssl: {
    //     rejectUnauthorized: false,
    // },
});

const CONFIRMATIONS_REQUIRED = 2; // Number of confirmations before considering a block final

async function updateBlocks() {
    const client = await pool.connect();

    try {
        const currentHeight = await getBlockHeight();
        const safeHeight = currentHeight - CONFIRMATIONS_REQUIRED; // Only process up to this block height
        let lastHeight = await getLastBlockNumberFromDB(client);

        // Now iterate only up to safeHeight to ensure confirmations
        for (let blockNumber = lastHeight + 1; blockNumber <= safeHeight; blockNumber++) {
            let pageNumber = 0;
            let more = true;

            while (more) {
                const blockData = await getBlockInscriptionsPage(blockNumber, pageNumber);
                await storeBlockData(client, blockNumber, blockData);
                more = blockData.more;
                pageNumber++;
            }
        }
    } finally {
        client.release();
    }
}



async function getLastBlockNumberFromDB(client: PoolClient) {
    const res = await client.query('SELECT MAX(block_number) as last_block FROM blocks');
    return res.rows[0].last_block || 2400000; // Start at 2400000 if no blocks are found
}

async function storeBlockData(client: PoolClient, blockNumber: number, blockData: { inscriptions: string[]; more: boolean; page_index: number; }) {
    const { inscriptions, more, page_index } = blockData;
    await client.query('INSERT INTO blocks (block_number, inscriptions, more, page_index) VALUES ($1, $2, $3, $4)', [blockNumber, inscriptions, more, page_index]);
}

// Initial update
updateBlocks();

// Schedule the update to run every 15 seconds
setInterval(updateBlocks, 15000);
