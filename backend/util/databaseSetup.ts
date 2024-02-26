// backend/util/databaseSetup.ts

import { Client } from 'pg';

// Initialize the client with your database connection details
const client = new Client({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});

// Function to create the tables and materialized views with unique indexes
const createDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to the database successfully.');

        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS update_progress (
                progress_key VARCHAR(255) PRIMARY KEY,
                last_processed_block INTEGER,
                last_processed_page INTEGER
            );

            CREATE TABLE IF NOT EXISTS inscriptions (
                inscription_id VARCHAR(255) PRIMARY KEY,
                address VARCHAR(255),
                content_length INTEGER,
                content_type VARCHAR(255),
                content_type_type VARCHAR(255),
                genesis_fee BIGINT,
                genesis_height INTEGER,
                inscription_number INTEGER,
                next VARCHAR(255),
                output_value BIGINT,
                parent VARCHAR(255),
                previous VARCHAR(255),
                processed BOOLEAN DEFAULT FALSE,
                nsfw BOOLEAN DEFAULT FALSE,
                rune VARCHAR(255),
                sat VARCHAR(255),
                satpoint VARCHAR(255),
                timestamp TIMESTAMP,
                charms TEXT[],
                children TEXT[]
            );
        `);

        await client.query(`
            ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE;
        `);

        // Future Feature, Ignore.
        // CREATE EXTENSION IF NOT EXISTS pgcrypto;
        // CREATE TABLE inscription_orders (
        //     blockchain_transaction_id VARCHAR(100),
        //     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        //     order_id SERIAL PRIMARY KEY,
        //     order_status TEXT,
        //     user_id TEXT,
        //     fee_ord_postage DECIMAL(12, 8),
        //     fee_service DECIMAL(12, 8),
        //     fee_send DECIMAL(12, 8),
        //     fee_inscribe DECIMAL(12, 8),
        //     encrypted_data BYTEA -- Encrypted data column,
        //     customer_oauth_ACCOUNT  //RESEARCH BEST WAY // TO BE encrypted_data
        //     customer_email VARCHAR(100), // TO BE encrypted_data
        //     customer_name VARCHAR(100), // TO BE encrypted_data
        //     customer_upload_ip TEXT // TO BE encrypted_data
        // );

        console.log('Tables created successfully.');

        // Create indexes for the inscriptions table
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_inscriptions_content_length ON inscriptions(content_length);
            CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type ON inscriptions(content_type);
            CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type_type ON inscriptions(content_type_type);
            CREATE INDEX IF NOT EXISTS idx_inscriptions_genesis_fee ON inscriptions(genesis_fee);
            CREATE INDEX IF NOT EXISTS idx_inscriptions_genesis_height ON inscriptions(genesis_height);
            CREATE INDEX IF NOT EXISTS idx_inscriptions_inscription_number ON inscriptions(inscription_number);
        `);
        console.log('Indexes created successfully.');

        // Create materialized views and indexes on those views
        const materializedViews = [
            { name: 'inscriptions_image', filter: "content_type_type = 'image'" },
            { name: 'inscriptions_model', filter: "content_type_type = 'model'" },
            { name: 'inscriptions_text', filter: "content_type_type = 'text'" },
            { name: 'inscriptions_video', filter: "content_type_type = 'video'" },
            { name: 'inscriptions_audio', filter: "content_type_type = 'audio'" },
            { name: 'inscriptions_application', filter: "content_type_type = 'application'" }
        ];

        for (const view of materializedViews) {
            await client.query(`
                CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS
                SELECT * FROM inscriptions WHERE ${view.filter};
            `);

            // Create unique index for concurrent refresh capability
            await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS ${view.name}_inscription_number_uindex ON ${view.name}(inscription_number);
            `);

            // Additional indexes based on inscriptions table
            await client.query(`
                CREATE INDEX IF NOT EXISTS ${view.name}_content_length ON ${view.name}(content_length);
                CREATE INDEX IF NOT EXISTS ${view.name}_content_type ON ${view.name}(content_type);
                CREATE INDEX IF NOT EXISTS ${view.name}_genesis_fee ON ${view.name}(genesis_fee);
                CREATE INDEX IF NOT EXISTS ${view.name}_genesis_height ON ${view.name}(genesis_height);
            `);
        }

        console.log('Materialized views and indexes on materialized views created successfully.');

        // Create additional materialized views for aggregated data
        await client.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS total_content_length AS
            SELECT SUM(content_length) AS total FROM inscriptions;

            CREATE MATERIALIZED VIEW IF NOT EXISTS total_genesis_fee AS
            SELECT SUM(genesis_fee) AS total FROM inscriptions;

            CREATE MATERIALIZED VIEW IF NOT EXISTS total_inscriptions AS
            SELECT COUNT(*) AS total FROM inscriptions;                       
        `);

        console.log('Materialized views for aggregated data created successfully.');
    } catch (e) {
        console.error('Error during database setup:', e);
    } finally {
        await client.end();
        console.log('Database setup complete. Client disconnected.');
    }
};

createDatabase();
