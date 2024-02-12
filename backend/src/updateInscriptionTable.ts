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

async function getLastProcessedBlock(): Promise<number> {
    try {
        const res = await pool.query('SELECT MAX(genesis_height) as last_processed_block FROM inscriptions');
        return res.rows[0].last_processed_block ? parseInt(res.rows[0].last_processed_block, 10) : 2400000; // Default to 2400000 or an appropriate starting block
    } catch (error) {
        console.error('Error fetching last processed block:', error);
        throw error;
    }
}

async function updateProgress(progressKey: string, lastProcessedBlock: number, lastProcessedPage: number): Promise<void> {


    const client = await pool.connect();
    try {

        const query = `
            INSERT INTO update_progress (progress_key, last_processed_block, last_processed_page)
            VALUES ($1, $2, $3)
            ON CONFLICT (progress_key)
            DO UPDATE SET last_processed_block = $2, last_processed_page = $3;
        `;
        const values = [progressKey, lastProcessedBlock, lastProcessedPage];
        await pool.query(query, values);

        console.log(`Progress updated successfully for key: ${progressKey}`);
    } catch (error) {
        console.error('Error updating progress:', error);
    } finally {
        await client.end();
    }
}


async function main() {
}


main()
    .catch(e => {
        console.error(e.message)
    }).finally(async () => {
        await pool.end();
    });