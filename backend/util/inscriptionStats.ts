// backend/util/inscriptionStats.ts

import { Pool } from 'pg';

const dbConfig = {
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
}

const pool = new Pool(dbConfig);

// Generic function to execute query with error handling
async function executeQuery(query: string) {
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Query execution error:', error);
        throw error; // Rethrow the error after logging it
    }
}

export const getContentLengthPerGenesisHeight = async () => {
    return executeQuery('SELECT genesis_height, SUM(content_length) FROM inscriptions GROUP BY genesis_height');
};

export const getTotalContentLength = async () => {
    const rows = await executeQuery('SELECT total FROM total_content_length');
    return rows[0]?.total;
};

export const getTotalGenesisFee = async () => {
    const rows = await executeQuery('SELECT total FROM total_genesis_fee');
    return rows[0]?.total;
};

export const getTotalInscriptions = async () => {
    const rows = await executeQuery('SELECT total FROM total_inscriptions');
    return rows[0]?.total;
};

export const getGenesisFeePerGenesisHeight = async () => {
    return executeQuery('SELECT genesis_height, SUM(genesis_fee) FROM inscriptions GROUP BY genesis_height');
};

export const getInscriptionNumberHighLow = async () => {
    const rows = await executeQuery('SELECT MAX(inscription_number) as high, MIN(inscription_number) as low FROM inscriptions');
    return rows[0];
};

export const getContentTypesDistribution_ = async () => {
    return executeQuery('SELECT content_type, COUNT(*) FROM inscriptions GROUP BY content_type ORDER BY COUNT(*) DESC');
};

// Improved function for categorizing content types with explicit error handling
export const getContentTypesDistribution = async () => {
    const rows = await executeQuery('SELECT content_type, COUNT(*) AS count FROM inscriptions GROUP BY content_type ORDER BY count DESC');

    let categorizedCounts = {
        Text: 0,
        Images: 0,
        Font: 0,
        Video: 0,
        Audio: 0,
        Applications: 0,
        Others: 0,
    };

    rows.forEach(row => {
        const { content_type, count } = row;
        const parsedCount = parseInt(count, 10);

        // Categorizing each MIME type
        if (content_type.startsWith('text/')) {
            categorizedCounts.Text += parsedCount;
        } else if (content_type.startsWith('image/')) {
            categorizedCounts.Images += parsedCount;
        } else if (content_type.startsWith('font/')) {
            categorizedCounts.Font += parsedCount;
        } else if (content_type.startsWith('video/')) {
            categorizedCounts.Video += parsedCount;
        } else if (content_type.startsWith('audio/')) {
            categorizedCounts.Audio += parsedCount;
        } else if (content_type.startsWith('application/')) {
            categorizedCounts.Applications += parsedCount;
        } else {
            // Categorize all other MIME types as Others
            categorizedCounts.Others += parsedCount;
        }
    });

    // Convert the object to an array format for consistency
    return Object.entries(categorizedCounts).map(([contentType, count]) => ({ content_type: contentType, count }));
};


// Ensure the pool is properly closed when the application is terminating
process.on('SIGINT', async () => {
    console.log('Closing database connection pool due to application termination');
    await pool.end();
    process.exit();
});

// Assuming an interface for database configuration for better type checking and IntelliSense support
export interface dbConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
}
