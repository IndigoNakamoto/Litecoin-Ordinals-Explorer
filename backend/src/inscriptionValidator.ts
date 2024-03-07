// backend/src/inscriptionValidator.ts

import { Pool } from 'pg';

// Setup database connection
const pool = new Pool({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine, 'postgres' if within Docker
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});

async function validateInscriptions(): Promise<void> {
    try {
        // First, get the max and min inscription numbers
        const res = await pool.query(`
            SELECT MAX(inscription_number) as max_inscription_number, MIN(inscription_number) as min_inscription_number
            FROM inscriptions
        `);

        const { max_inscription_number, min_inscription_number } = res.rows[0];

        // Calculate the range as the difference between max and min
        const range = max_inscription_number - min_inscription_number;

        // Then, perform the validation query using this range
        const validationRes = await pool.query(`
            SELECT COUNT(*) as total_records
            FROM inscriptions
            WHERE inscription_number >= $1 AND inscription_number <= $2
        `, [min_inscription_number, max_inscription_number]);

        const { total_records } = validationRes.rows[0];

        console.log(`Validation Result:
            - Highest Inscription Number: ${max_inscription_number}
            - Lowest Inscription Number: ${min_inscription_number}
            - Range: ${range}
            - Total Records: ${total_records}
        `);
    } catch (error) {
        console.error('Error validating inscriptions:', error);
        throw error;
    }
}

validateInscriptions().finally(() => {
    pool.end().then(() => {
        console.log('Pool has ended');
        process.exit(0);
    }).catch((error) => {
        console.error('Error during pool shutdown:', error);
        process.exit(1);
    });
});