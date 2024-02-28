//backend/src/users.ts

import { Pool } from 'pg';
import { getInscriptionData, getBlockHeight, getBlockInscriptionsPage } from '../util/ord-litecoin';

// Setup database connection
const pool = new Pool({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine, 'postgres' if within Docker
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});
