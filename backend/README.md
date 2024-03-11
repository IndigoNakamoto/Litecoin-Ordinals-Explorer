
## Mac Mini 

### Litecoind
cd /usr/local/bin
./litecoind

### Ord
cd /Volumes/SanDisk/ord-litecoin-0.15.0
./ord --bitcoin-rpc-pass 'your_rpc_password' --bitcoin-rpc-user 'your_rpc_username' server -j


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

### WARNING: Clear the Persistent Volume
From: /Users/indigo/Dev/ordlite.io/backend/docker
Run Command: sudo rm -rf ../../database/postgres_data/*

### WARNING: Continue
Run Command: docker-compose up -d
Run Command: docker logs docker-postgres-1
Note: Look for messages indicating that the user and database have been created. You should not see the message about skipping initialization this time.

### CONFLICTING SERVICES: 
FIRST CHECK: lsof -i :5432
SECOND CHECK: netstat -an | grep 5432
IF MANY, RUN COMMAND:  brew services stop postgresql

### ACCESS SHELL:
docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db

### LISTING DATABASES:
docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db -c "\l"

### LISTING USERS
docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db -c "\du"

### Setup Database:
Run Command: npx ts-node ./backend/util/databaseSetup.ts
npx ts-node ./backend/util/prismadatabaseSetup.ts


### Update Inscriptions
npx ts-node ./backend/src/inscriptionUpdater.ts

### Update Materialized Views
npx ts-node ./backend/src/materializedViewUpdater.ts


### Connect to the PostgreSQL Database: 
Run Command: psql -h localhost -U ord_lite_user -d ord_lite_db -W
Other Command: \q

## Ord
### Start Ord Server (username and password needed for rpc bitcoin api)
./ord --bitcoin-rpc-user your_rpc_username --bitcoin-rpc-pass your_rpc_password server -j



# PRISMA
1. docker
docker compose up -d
2. prismadatabasesetup
npx ts-node ./backend/util/prismadatabasesetup.ts

3. Verify Views
docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db
\dm
\dt inscriptions*
\dv inscriptions_video
\dm inscriptions_video
\dm+


4. 
npx prisma db pull

3. Manually setup materalized views
docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db

CREATE MATERIALIZED VIEW inscriptions_video AS
SELECT * FROM inscriptions WHERE content_type_type = 'video';

CREATE MATERIALIZED VIEW inscriptions_audio AS
SELECT * FROM inscriptions WHERE content_type_type = 'audio';

CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_video_inscription_number_uindex ON inscriptions_video(inscription_number);
CREATE UNIQUE INDEX IF NOT EXISTS inscriptions_audio_inscription_number_uindex ON inscriptions_audio(inscription_number);

VERIFY:
SELECT matviewname FROM pg_matviews WHERE matviewname IN ('inscriptions_video', 'inscriptions_audio');

3. prisma migrate 
prisma migrate dev --name init
4. update inscriptions
npx ts-node ./src/prismaInscriptionUpdater.ts




