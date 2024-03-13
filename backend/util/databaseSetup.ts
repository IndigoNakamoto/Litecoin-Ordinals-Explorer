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
            last_processed_page INTEGER);

        CREATE TABLE IF NOT EXISTS inscriptions (
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
            script_pubkey VARCHAR(255),
            metadata varchar(255),
            charms TEXT[],
            genesis_address VARCHAR(255),
            inscription_id VARCHAR(255),
            children TEXT[],
            processed BOOLEAN DEFAULT FALSE,
            rune VARCHAR(255),
            sat VARCHAR(255),
            satpoint VARCHAR(255),
            timestamp TIMESTAMP,
            nsfw BOOLEAN DEFAULT FALSE,
            CONSTRAINT inscriptions_pkey PRIMARY KEY (inscription_id, content_type_type)
        ) PARTITION BY LIST (content_type_type);

        CREATE TABLE IF NOT EXISTS inscriptions_default PARTITION OF inscriptions DEFAULT;
        CREATE TABLE IF NOT EXISTS inscriptions_text PARTITION OF inscriptions FOR VALUES IN ('text');
        CREATE TABLE IF NOT EXISTS inscriptions_image PARTITION OF inscriptions FOR VALUES IN ('image');
        CREATE TABLE IF NOT EXISTS inscriptions_video PARTITION OF inscriptions FOR VALUES IN ('video');
        CREATE TABLE IF NOT EXISTS inscriptions_audio PARTITION OF inscriptions FOR VALUES IN ('audio');
        CREATE TABLE IF NOT EXISTS inscriptions_model PARTITION OF inscriptions FOR VALUES IN ('model');
        CREATE TABLE IF NOT EXISTS inscriptions_application PARTITION OF inscriptions FOR VALUES IN ('application');
        `);

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
            // { name: 'inscriptions_image', filter: "content_type_type = 'image'" },
            // { name: 'inscriptions_model', filter: "content_type_type = 'model'" },
            // { name: 'inscriptions_text', filter: "content_type_type = 'text'" },
            { name: 'inscriptions_video_view', filter: "content_type_type = 'video'" },
            { name: 'inscriptions_audio_view', filter: "content_type_type = 'audio'" },
            // { name: 'inscriptions_application', filter: "content_type_type = 'application'" }
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
            // CREATE INDEX IF NOT EXISTS ${view.name}_content_length ON ${view.name}(content_length);
            // CREATE INDEX IF NOT EXISTS ${view.name}_genesis_fee ON ${view.name}(genesis_fee);
            await client.query(`
                CREATE INDEX IF NOT EXISTS ${view.name}_content_type ON ${view.name}(content_type);
                CREATE INDEX IF NOT EXISTS ${view.name}_inscription_number ON ${view.name}(inscription_number);

            `);
        }

        console.log('Materialized views and indexes on materialized views created successfully.');

    } catch (e) {
        console.error('Error during database setup:', e);
    } finally {
        await client.end();
        console.log('Database setup complete. Client disconnected.');
    }
};

createDatabase();
