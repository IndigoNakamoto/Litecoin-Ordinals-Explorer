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
                rune VARCHAR(255),
                sat VARCHAR(255),
                satpoint VARCHAR(255),
                timestamp TIMESTAMP,
                charms TEXT[],
                children TEXT[]
            );
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

        // Create materialized views
        // TODO
        // add text JSON
        // add text Javascript
        await client.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_image AS
            SELECT * FROM inscriptions WHERE content_type_type = 'image';
            
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_image_svg AS
            SELECT * FROM inscriptions WHERE content_type = 'image/svg+xml';

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_image_gif AS
            SELECT * FROM inscriptions WHERE content_type = 'image/gif';

            
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_model AS
            SELECT * FROM inscriptions WHERE content_type_type = 'model';

            
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_text AS
            SELECT * FROM inscriptions WHERE content_type_type = 'text';
            
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_text_html AS
            SELECT * FROM inscriptions WHERE content_type = 'text/html;charset=utf-8';

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_text_javascript AS
            SELECT * FROM inscriptions WHERE content_type = 'text/javascript';
        

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_video AS
            SELECT * FROM inscriptions WHERE content_type_type = 'video';
            

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_audio AS
            SELECT * FROM inscriptions WHERE content_type_type = 'audio';

            
            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_application AS
            SELECT * FROM inscriptions WHERE content_type_type = 'application';

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_application_pdf AS
            SELECT * FROM inscriptions WHERE content_type = 'application/pdf';

            CREATE MATERIALIZED VIEW IF NOT EXISTS inscriptions_application_json AS
            SELECT * FROM inscriptions WHERE content_type = 'application/json';

            
            CREATE MATERIALIZED VIEW IF NOT EXISTS total_content_length AS
            SELECT SUM(content_length) AS total FROM inscriptions;

            CREATE MATERIALIZED VIEW IF NOT EXISTS total_genesis_fee AS
            SELECT SUM(genesis_fee) AS total FROM inscriptions;

            CREATE MATERIALIZED VIEW IF NOT EXISTS total_inscriptions AS
            SELECT COUNT(*) AS total FROM inscriptions;                       
        `);
        console.log('Materialized views created successfully.');

        // Create unique indexes on materialized views for concurrent refresh capability
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_image_inscription_number_uindex ON inscriptions_image(inscription_number);
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_image_svg_inscription_number_uindex ON inscriptions_image_svg(inscription_number);
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_image_gif_inscription_number_uindex ON inscriptions_image_gif(inscription_number);

            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_model_inscription_number_uindex ON inscriptions_model(inscription_number);

            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_text_inscription_number_uindex ON inscriptions_text(inscription_number);
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_text_html_inscription_number_uindex ON inscriptions_text_html(inscription_number);
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_text_javascript_inscription_number_uindex ON inscriptions_text_javascript(inscription_number);
            
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_video_inscription_number_uindex ON inscriptions_video(inscription_number);

            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_audio_inscription_number_uindex ON inscriptions_audio(inscription_number);

            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_application_inscription_number_uindex ON inscriptions_application(inscription_number);    
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_application_pdf_inscription_number_uindex ON inscriptions_application_pdf(inscription_number);
            CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_application_json_inscription_number_uindex ON inscriptions_application_json(inscription_number);
 

        `);
        console.log('Unique indexes on materialized views created successfully.');
    } catch (e) {
        console.error('Error during database setup:', e);
    } finally {
        await client.end();
        console.log('Database setup complete. Client disconnected.');
    }
};

createDatabase();
