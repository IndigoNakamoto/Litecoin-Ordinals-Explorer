
## Docker Postgres Server
### Start docker postgres server
Change Directory: cd backend/docker 
Run Command: docker-compose up -d

### Check the running containers:
Run Command: docker ps

### Stop the Docker Compose services:
Run Command: docker-compose down

### WARNING: Will remove the postgres data in volume
Run Command: docker-compose down -v


## Ord
### Start Ord Server
./ord --bitcoin-rpc-user your_rpc_username --bitcoin-rpc-pass your_rpc_password server -j

