import { Client } from 'pg';

const client = new Client({
    user: 'ord_lite_user',
    password: 'ord_lite_pass',
    host: 'localhost',
    port: 5432,
    database: 'ord_lite_db',
});

const createDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to the database successfully.');

        // Create the main table and partitions
        await client.query(`

        CREATE TABLE IF NOT EXISTS inscriptions (
            inscription_id VARCHAR(255),
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
            children TEXT[],
            CONSTRAINT inscriptions_pkey PRIMARY KEY (inscription_id, content_type_type)
        ) PARTITION BY LIST (content_type_type);

        CREATE TABLE IF NOT EXISTS inscriptions_default PARTITION OF inscriptions DEFAULT;
        CREATE TABLE IF NOT EXISTS inscriptions_text PARTITION OF inscriptions FOR VALUES IN ('text');
        CREATE TABLE IF NOT EXISTS inscriptions_image PARTITION OF inscriptions FOR VALUES IN ('image');
        CREATE TABLE IF NOT EXISTS inscriptions_video PARTITION OF inscriptions FOR VALUES IN ('video');
        CREATE TABLE IF NOT EXISTS inscriptions_audio PARTITION OF inscriptions FOR VALUES IN ('audio');
        CREATE TABLE IF NOT EXISTS inscriptions_model PARTITION OF inscriptions FOR VALUES IN ('model');
        `);
        console.log('Tables and partitions created successfully.');

        await client.query(`
        CREATE TABLE IF NOT EXISTS update_progress (
            progress_key VARCHAR(255) PRIMARY KEY,
            last_processed_block INTEGER,
            last_processed_page INTEGER);`
        );

        // Create materialized views
        const materializedViews = [
            { name: 'mv_inscriptions_video', filter: "content_type_type = 'video'" },
            { name: 'mv_inscriptions_audio', filter: "content_type_type = 'audio'" },
        ];

        for (const view of materializedViews) {
            await client.query(`
                CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS
                SELECT * FROM inscriptions WHERE ${view.filter};
            `);

            await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS ${view.name}_idx ON ${view.name} (inscription_number);
            `);
        }
        console.log('Materialized views and indexes created successfully.');

    } catch (e) {
        console.error('Error during database setup:', e);
    } finally {
        await client.end();
        console.log('Database setup complete. Client disconnected.');
    }
};

createDatabase();



// import { Client } from 'pg';

// const client = new Client({
//     user: 'ord_lite_user',
//     password: 'ord_lite_pass',
//     host: 'localhost',
//     port: 5432,
//     database: 'ord_lite_db',
// });

// const createDatabase = async () => {
//     try {
//         await client.connect();
//         console.log('Connected to the database successfully.');

//         // Create tables
//         await client.query(`
//         CREATE TABLE  IF NOT EXISTS inscriptions (
//             inscription_id VARCHAR(255),
//             address VARCHAR(255),
//             content_length INTEGER,
//             content_type VARCHAR(255),
//             content_type_type VARCHAR(255),
//             genesis_fee BIGINT,
//             genesis_height INTEGER,
//             inscription_number INTEGER,
//             next VARCHAR(255),
//             output_value BIGINT,
//             parent VARCHAR(255),
//             previous VARCHAR(255),
//             processed BOOLEAN DEFAULT FALSE,
//             nsfw BOOLEAN DEFAULT FALSE,
//             rune VARCHAR(255),
//             sat VARCHAR(255),
//             satpoint VARCHAR(255),
//             timestamp TIMESTAMP,
//             charms TEXT[],
//             children TEXT[],
//             CONSTRAINT inscriptions_pkey PRIMARY KEY (inscription_id, content_type_type)
//         ) PARTITION BY LIST (content_type_type);
        
//             CREATE TABLE  IF NOT EXISTS inscriptions_default PARTITION OF inscriptions DEFAULT;
//         `);


//         // Partition content_type_type for text and images
//         await client.query(`
//             CREATE TABLE  IF NOT EXISTS inscriptions_text PARTITION OF inscriptions FOR VALUES IN ('text');
//             CREATE TABLE  IF NOT EXISTS inscriptions_image PARTITION OF inscriptions FOR VALUES IN ('image');
//             CREATE TABLE  IF NOT EXISTS inscriptions_video PARTITION OF inscriptions FOR VALUES IN ('video');
//             CREATE TABLE  IF NOT EXISTS inscriptions_audio PARTITION OF inscriptions FOR VALUES IN ('audio');
//             CREATE TABLE  IF NOT EXISTS inscriptions_model PARTITION OF inscriptions FOR VALUES IN ('model');
//         `);
//         console.log('Partitioning completed.');

//         // Create materialized views and indexes on those views
//         const materializedViews = [
//             // { name: 'inscriptions_image', filter: "content_type_type = 'image'" },
//             // { name: 'inscriptions_model', filter: "content_type_type = 'model'" },
//             // { name: 'inscriptions_text', filter: "content_type_type = 'text'" },
//             { name: 'inscriptions_video', filter: "content_type_type = 'video'" },
//             { name: 'inscriptions_audio', filter: "content_type_type = 'audio'" },
//             // { name: 'inscriptions_application', filter: "content_type_type = 'application'" }
//         ];

//         for (const view of materializedViews) {
//             await client.query(`
//                 CREATE MATERIALIZED VIEW IF NOT EXISTS ${view.name} AS
//                 SELECT * FROM inscriptions WHERE ${view.filter};
//             `);

//             // Create unique index for concurrent refresh capability
//             await client.query(`
//                 CREATE UNIQUE INDEX IF NOT EXISTS ${view.name}_inscription_number_uindex ON ${view.name}(inscription_number);
//             `);
//         }

//         console.log('Materialized views and indexes on materialized views created successfully.');

//     } catch (e) {
//         console.error('Error during database setup:', e);
//     } finally {
//         await client.end();
//         console.log('Database setup complete. Client disconnected.');
//     }
// };

// createDatabase();
