import { Client } from 'pg';

// Initialize the client with your database connection details
const client = new Client({
    user: 'ord_lite_user',
    password: 'ord_lite_pass',
    host: 'localhost',
    database: 'ord_lite_db',
    port: 5432,
});

// Function to refresh materialized views concurrently
const refreshMaterializedViews = async () => {
    const materializedViews = [
        'inscriptions_svg_view',
        'inscriptions_gif_view',
        'inscriptions_html_view',
        'inscriptions_pdf_view',
        'inscriptions_json_view',
    ];

    try {
        await client.connect();
        console.log('Connected to the database successfully.');

        for (const viewName of materializedViews) {
            console.log(`Refreshing materialized view: ${viewName}`);
            await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`);
            console.log(`${viewName} refreshed successfully.`);
        }
    } catch (e) {
        console.error('Error during materialized view refresh:', e);
    } finally {
        await client.end();
        console.log('Materialized view refresh complete. Client disconnected.');
    }
};

// Main function to run the refresh process
const main = async () => {
    console.log('Starting materialized view refresh process...');
    await refreshMaterializedViews();
};

// Setting up a timer to run the main function every 5 minutes
setInterval(() => {
    main();
}, 300000); // 300,000 milliseconds = 5 minutes

// Optionally, you can immediately invoke the main function if you want the process to start immediately instead of waiting for the first 5-minute interval to pass
main();
