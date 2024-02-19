// backend/util/inscriptionStats.ts

import { Pool } from 'pg';

// Initialize the pool with your database connection details
const pool = new Pool({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});



// Function to get the total sum of content length per genesis_height
export const getContentLengthPerGenesisHeight = async () => {
    const result = await pool.query('SELECT genesis_height, SUM(content_length) FROM inscriptions GROUP BY genesis_height');
    return result.rows;
};

// Function to get the total sum of content length
export const getTotalContentLength = async () => {
    // Query the materialized view instead of the base table
    const result = await pool.query('SELECT total FROM total_content_length');
    return result.rows[0].total;
};


// Function to get the total sum of genesis_fee
export const getTotalGenesisFee = async () => {
    // Query the materialized view instead of the base table
    const result = await pool.query('SELECT total FROM total_genesis_fee');
    return result.rows[0].total;
};


// Function to get the total number of inscriptions
export const getTotalInscriptions = async () => {
    // Query the materialized view instead of the base table
    const result = await pool.query('SELECT total FROM total_inscriptions');
    return result.rows[0].total;
};


// Function to get the total sum of genesis_fee per genesis_height
export const getGenesisFeePerGenesisHeight = async () => {
    const result = await pool.query('SELECT genesis_height, SUM(genesis_fee) FROM inscriptions GROUP BY genesis_height');
    return result.rows;
};

// Function to get the high/low value for inscription_number
export const getInscriptionNumberHighLow = async () => {
    const result = await pool.query('SELECT MAX(inscription_number) as high, MIN(inscription_number) as low FROM inscriptions');
    return result.rows[0];
};

// Function to get the distribution of content types
export const getContentTypesDistribution = async () => {
    const result = await pool.query('SELECT content_type, COUNT(*) FROM inscriptions GROUP BY content_type ORDER BY COUNT(*) DESC');
    return result.rows;
};

// Function to get the distribution of content types
export const getContentTypesDistribution2 = async () => {
    const result = await pool.query('SELECT content_type, COUNT(*) AS count FROM inscriptions GROUP BY content_type ORDER BY count DESC');
    const rows = result.rows;

    // Initialize an object to hold categorized counts
    let categorizedCounts = {
        "Text": 0,
        "ImagesAll": 0,
        "ImagesSVG": 0,
        "ImagesGIFs": 0,
        "HTML": 0,
        "3D": 0,
        "Video": 0,
        "Audio": 0,
        "JSON": 0,
        "PDF": 0,
        "Javascript": 0,

    };

    rows.forEach(row => {
        const { content_type, count } = row;
        const parsedCount = parseInt(count, 10); // Explicit parsing for clarity

        if (content_type.startsWith('image/')) {
            categorizedCounts["ImagesAll"] += parsedCount;
        } else if (content_type === "image/svg+xml") {
            categorizedCounts["ImagesSVG"] += parsedCount;
        } else if (content_type === 'image/gif') {
            categorizedCounts["ImagesGIFs"] += parsedCount;
        } else if (content_type === 'text/html;charset=utf-8') {
            categorizedCounts["HTML"] += parsedCount;
        } else if (content_type === 'model/gltf-binary') {
            categorizedCounts["3D"] += parsedCount;
        } else if (content_type.startsWith('video/')) {
            categorizedCounts["Video"] += parsedCount;
        } else if (content_type.startsWith('text/plain')) {
            categorizedCounts["Text"] += parsedCount;
        } else if (content_type.startsWith('audio/')) {
            categorizedCounts["Audio"] += parsedCount;
        } else if (content_type === 'application/json') {
            categorizedCounts["JSON"] += parsedCount;
        } else if (content_type === 'application/pdf') {
            categorizedCounts["PDF"] += parsedCount;
        } else if (content_type === 'text/javascript') {
            categorizedCounts["Javascript"] += parsedCount;
        } 
    });

    // Convert the object to an array format similar to the original query's result for consistency
    return Object.entries(categorizedCounts).map(([contentType, count]) => ({ content_type: contentType, count }));
};

