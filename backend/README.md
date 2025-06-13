# OrdLite.io Backend

This document provides instructions for setting up, running, and managing the backend services for OrdLite.io.

## 1. Overview

The OrdLite.io backend handles core logic, data management, and API services for the platform. It interacts with a Litecoin node (`litecoind`) and an Ordinal indexer (`ord`) to process and serve information about Litecoin inscriptions.

**Core Technologies:**
*   Node.js
*   TypeScript
*   PostgreSQL (managed with Prisma and Docker)
*   Ord
*   Litecoin Core (`litecoind`)

## 2. Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js:** LTS version recommended (e.g., v18.x or v20.x).
*   **npm** or **yarn:** For managing Node.js packages.
*   **Docker & Docker Compose:** For running the PostgreSQL database.
*   **Git:** For version control.
*   **Litecoin Core (`litecoind`):** A running instance of `litecoind` is required. Ensure it's fully synced and RPC is enabled.
*   **Ord (`ord`):** The Ordinal indexer compatible with Litecoin. Ensure it's installed and accessible, either in your system PATH or by providing a direct path.

## 3. Getting Started / Local Development Setup

### 3.1. Clone the Repository
Clone the main Litecoin-Ordinals-Explorer repository or your fork:
```bash
git clone https://github.com/your-username/Litecoin-Ordinals-Explorer.git # Example: your fork
# or
# git clone https://github.com/IndigoNakamoto/Litecoin-Ordinals-Explorer.git # Replace with the actual main repository URL
cd Litecoin-Ordinals-Explorer/backend
```

### 3.2. Install Dependencies
```bash
npm install
```
*(If your project uses yarn, run `yarn install` instead)*

### 3.3. Environment Configuration
Create a `.env` file in the `backend` directory. You can often copy from an `.env.example` if one exists, or create it manually.
It should contain at least the following variables:

```env
# Database connection (if not using Docker defaults directly or for Prisma)
DATABASE_URL="postgresql://ord_lite_user:your_strong_password@localhost:5432/ord_lite_db?schema=public"

# Litecoin RPC Credentials (used by Ord and potentially the backend)
LITECOIN_RPC_USER="your_rpc_username"
LITECOIN_RPC_PASS="your_rpc_password"
LITECOIN_RPC_HOST="127.0.0.1" # Or your litecoind host
LITECOIN_RPC_PORT="9332"     # Or your litecoind RPC port

# Ord command path (if not in system PATH)
# ORD_PATH="/path/to/your/ord"
```
**Note:** Ensure your `litecoind` is configured with the RPC user and password specified here.

### 3.4. Setup and Run Local Litecoin Node (`litecoind`)
Ensure `litecoind` is running. If you need to start it:
```bash
# Example command (consult Litecoin Core documentation for full options)
litecoind -daemon
```
Wait for it to fully sync if it's a new setup.

### 3.5. Setup and Run Ord Service
The `ord` service indexes inscriptions from your Litecoin node.
```bash
# Example command (ensure RPC credentials match your litecoin.conf and .env)
# If ord is in your PATH:
ord --bitcoin-rpc-user "${LITECOIN_RPC_USER}" --bitcoin-rpc-pass "${LITECOIN_RPC_PASS}" server -j
# If using a specific path to ord:
# /path/to/your/ord --bitcoin-rpc-user "${LITECOIN_RPC_USER}" --bitcoin-rpc-pass "${LITECOIN_RPC_PASS}" server -j
```
*(Note: `ord` typically uses `--bitcoin-rpc-user/pass` flags even for Litecoin. Adjust if your `ord` version uses different flags.)*
Keep this service running.

## 4. Database Management (PostgreSQL with Docker & Prisma)

The backend uses a PostgreSQL database, managed via Docker Compose and Prisma.

### 4.1. Start PostgreSQL Docker Container
Navigate to the Docker directory and start the services:
```bash
cd docker # From the backend/ directory
docker-compose up -d
```
To check the logs (e.g., for initialization messages):
```bash
docker logs backend-postgres-1 # The service name might vary, check your docker-compose.yml
```

### 4.2. Initialize Database Schema & Data
These scripts set up the database schema and potentially initial data.
Run these from the `backend` directory:

```bash
# Primary script for setting up/migrating schema using Prisma
npx prisma migrate dev --name initial_setup # Or an appropriate migration name
# Or if you need to apply pending migrations:
# npx prisma migrate deploy

# The following script `prismadatabaseSetup.ts` might be for initial seeding or specific view creations.
# Review its contents before running.
npx ts-node ./util/prismadatabaseSetup.ts

# The script `databaseSetup.ts` might be legacy or for non-Prisma managed parts.
# Review its contents if you believe it's necessary.
# npx ts-node ./util/databaseSetup.ts
```
**Note:** It's recommended to rely on Prisma migrations (`prisma migrate`) for schema changes primarily.

### 4.3. Accessing the Database Shell
You can connect to the PostgreSQL instance running in Docker:
```bash
# Ensure you are in the backend/docker directory or adjust path to docker-compose.yml
docker exec -it backend-postgres-1 psql -U ord_lite_user -d ord_lite_db
```
*(The container name `backend-postgres-1` might vary based on your `docker-compose.yml` service name and project directory.)*

Useful psql commands:
*   `\l`: List all databases.
*   `\du`: List all users.
*   `\dt *`: List all tables in the current database.
*   `\dv *`: List all views.
*   `\dm *`: List all materialized views.
*   `\q`: Quit psql.

### 4.4. Stopping the Database
```bash
cd docker # From the backend/ directory
docker-compose down
```

### 4.5. Clearing Database Volume (Data Loss Warning!)
To remove all data stored in the PostgreSQL Docker volume:
```bash
cd docker # From the backend/ directory
```
> **WARNING:** This command will permanently delete all PostgreSQL data. Use with caution.
```bash
docker-compose down -v
```

## 5. Running the Backend Application

To start the backend application server:
```bash
# For development with auto-reloading (check package.json for the exact script)
npm run dev

# For a production-like start (check package.json)
# npm start
```
Consult `package.json` for the definitive scripts for starting the application.

## 6. Core Services & Data Updaters

These scripts handle ongoing data synchronization and maintenance.

### 6.1. Inscription Update Service
This service likely keeps inscription data synchronized with the blockchain/Ord index.
```bash
# From the backend directory
# This seems to be the intended service for continuous updates:
npx ts-node ./app/services/InscriptionUpdateService.ts
```
*(Review `InscriptionUpdateService.ts` for its exact behavior. The original README noted "change to setInterval later," implying it's a long-running service.)*

Alternatively, `src/inscriptionUpdater.ts` might be a manual script or an older version:
```bash
# npx ts-node ./src/inscriptionUpdater.ts
```

### 6.2. Materialized View Updater
This script refreshes materialized views, which can improve query performance.
```bash
# From the backend directory
npx ts-node ./src/materializedViewUpdater.ts
```
This might need to be run periodically or after significant data changes.

### 6.3. Other Setup Scripts (from `backend/app/setup/`)
These scripts might be for one-time initial setup tasks.
```bash
# From the backend directory
# npx ts-node ./app/setup/inscription.ts
# npx ts-node ./app/setup/index.ts
```
*(Review these scripts to understand their purpose and if they are needed for your setup.)*

## 7. VPS Deployment Guide (Example)

This is a basic guide for deploying the backend to a Virtual Private Server (VPS).

### 7.1. Prerequisites on VPS
Ensure Docker, Docker Compose, Git, Node.js, Litecoin Core (`litecoind`), and `ord` are installed and configured on your VPS.

### 7.2. Clone Project
Clone the main Litecoin-Ordinals-Explorer repository or your fork:
```bash
git clone https://github.com/your-username/Litecoin-Ordinals-Explorer.git # Example: your fork
# or
# git clone https://github.com/IndigoNakamoto/Litecoin-Ordinals-Explorer.git # Replace with the actual main repository URL
cd Litecoin-Ordinals-Explorer/backend
```

### 7.3. Configuration
*   Copy your production `.env` file to the `backend` directory on the VPS.
*   Ensure `npm install` has been run.

### 7.4. Run Services Persistently
You'll want to run `litecoind`, `ord`, the PostgreSQL database, and the backend application/services in a way that they persist after you disconnect and restart on failure. Tools like `systemd` or `pm2` (for Node.js apps) are recommended.

*   **Litecoin Daemon (`litecoind`):**
    ```bash
    # Example: Run as a daemon
    litecoind -daemon
    # Consider setting up a systemd service for litecoind.
    ```

*   **Ord Server:**
    ```bash
    # Example using pm2:
    # pm2 start ord --name "ord-server" -- --bitcoin-rpc-user "user" --bitcoin-rpc-pass "pass" server -j
    # Or run in a screen/tmux session if not using a process manager.
    ```

*   **PostgreSQL Database (Docker):**
    ```bash
    cd docker
    docker-compose up -d # Docker's restart policies can handle persistence.
    ```

*   **Backend Application & Services (Example with `pm2`):**
    Install `pm2` globally: `npm install -g pm2`
    From the `backend` directory:
    ```bash
    # Start the main application (assuming 'npm start' is your production start script)
    pm2 start npm --name "ordlite-backend-app" -- run start

    # Start the inscription update service
    pm2 start ./app/services/InscriptionUpdateService.ts --name "inscription-service" --interpreter npx --interpreter-args ts-node

    # Start other services like materializedViewUpdater if needed as persistent services
    # pm2 start ./src/materializedViewUpdater.ts --name "view-updater" --interpreter npx --interpreter-args ts-node
    ```
    Save `pm2` process list and configure startup script:
    ```bash
    pm2 save
    pm2 startup
    ```

## 8. Troubleshooting

*   **PostgreSQL Port Conflicts (e.g., Port 5432 already in use):**
    If `docker-compose up -d` fails due to port conflicts:
    ```bash
    # Check for listening processes on port 5432
    sudo lsof -i :5432
    # Or
    sudo netstat -tulnp | grep 5432
    ```
    Identify and stop the conflicting service. For example, if another PostgreSQL instance is running:
    ```bash
    # Example: Stop a conflicting Homebrew PostgreSQL service on macOS
    # brew services stop postgresql
    # Example: Stop a systemd PostgreSQL service on Linux
    # sudo systemctl stop postgresql
    ```

*   **Prisma Client Generation:**
    If you encounter issues with Prisma Client, ensure it's generated:
    ```bash
    npx prisma generate
    ```

---

This README provides a general guide. Specifics may vary based on project evolution. Always refer to `package.json` for exact script names and consult individual script files for detailed behavior.
