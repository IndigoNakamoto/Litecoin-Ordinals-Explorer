// backend/util/databaseSetup.ts

import { Pool } from 'pg';

// Setup the connection pool
const pool = new Pool({
    // Your database connection details
    user: 'your_username',
    host: 'localhost',
    database: 'ordinals',
    password: 'your_password',
    port: 5432, // Default PostgreSQL port
});

// Function to create the tables
const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS blocks (
            block_number INTEGER PRIMARY KEY,
            total_pages INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            parent_hash VARCHAR(255)
        );
        CREATE TABLE IF NOT EXISTS inscriptions (
            inscription_id VARCHAR(255) PRIMARY KEY,
            address VARCHAR(255),
            content_length INTEGER,
            content_type VARCHAR(255),
            genesis_fee BIGINT,
            genesis_height INTEGER,
            inscription_number INTEGER,
            next VARCHAR(255),
            output_value BIGINT,
            parent VARCHAR(255),
            previous VARCHAR(255),
            rune VARCHAR(255),
            sat VARCHAR(255),
            satpoint VARCHAR(255),
            timestamp TIMESTAMP,
            -- Storing arrays as JSON for flexibility; adjust based on your use case
            charms TEXT[],
            children TEXT[]
        );
        CREATE TABLE IF NOT EXISTS block_inscriptions (
            block_number INTEGER,
            inscription_id VARCHAR(255),
            page_index INTEGER NOT NULL,
            PRIMARY KEY (block_number, inscription_id),
            FOREIGN KEY (block_number) REFERENCES blocks (block_number) ON DELETE CASCADE,
            FOREIGN KEY (inscription_id) REFERENCES inscriptions(inscription_id) ON DELETE CASCADE
        );
    `).then(() => console.log('Tables created successfully'))
      .catch(e => console.error('Error creating tables', e.stack))
      .finally(() => pool.end());
};

createTables();