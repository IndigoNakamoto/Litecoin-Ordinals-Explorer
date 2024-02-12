// backend/config/Inscription.ts

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
        CREATE TABLE IF NOT EXISTS inscriptions (
            id INTEGER,
            content_length INTEGER,
            content_type VARCHAR(255),
            content_type_type VARCHAR(255),
            genesis_fee BIGINT,
            genesis_height INTEGER,
            inscription_number INTEGER,
            inscription_id VARCHAR(255),
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
        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type ON inscriptions(content_type);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_inscription_number ON inscriptions(inscription_number);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_length ON inscriptions(content_length);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type_type ON inscriptions(content_type_type);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_genesis_fee ON inscriptions(genesis_fee);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_genesis_height ON inscriptions(genesis_height);

        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type_inscription_number ON inscriptions(content_type, inscription_number);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type_genesis_fee ON inscriptions(content_type, genesis_fee);
        CREATE INDEX IF NOT EXISTS idx_inscriptions_content_type_content_length ON inscriptions(content_type, content_length);

        `);
        console.log('Indexes created successfully.');


        // Create materialized views and indexes on those views
        const materializedViews = [
            { name: 'inscriptions_svg_view', filter: "content_type = 'image/svg'" },
            { name: 'inscriptions_gif_view', filter: "content_type = 'image/gif'" },
            { name: 'inscriptions_html_view', filter: "content_type = 'text/html'" },
            { name: 'inscriptions_pdf_view', filter: "content_type = 'application/pdf'" },
            { name: 'inscriptions_json_view', filter: "content_type = 'application/json'" },
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
