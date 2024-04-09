
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
OR
docker ps
docker kill <container>
OR
sudo docker rm -f 158387e64292
OR
sudo snap stop docker

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

### CLOSE A STUCK PROCESS
ps aux | grep 'ord --bitcoin-rpc-user'
kill <PID>
OR
kill -9 <PID>





# VPS System Setup
1. SSH into VPS
cd ~/.ssh
ssh -i id_rsa_mini root@146.190.169.166

## 2. Install Docker
### Resources
https://docs.docker.com/engine/install/ubuntu/
### Commands


## 3. Install Litecoin
### Resources
https://chat.openai.com/c/6cedf22d-764f-4eed-b70b-0dec19e00aef 
### Commands
sudo apt update
sudo apt upgrade -y
wget https://download.litecoin.org/litecoin-0.21.2.2/linux/litecoin-0.21.2.2-x86_64-linux-gnu.tar.gz
tar -xvzf litecoin-0.21.2.2-x86_64-linux-gnu.tar.gz
sudo cp bin/* /usr/local/bin/
mkdir ~/.litecoin
nano ~/.litecoin/litecoin.conf
litecoind -daemon
litecoin-cli getblockchaininfo
litecoin-cli stop

#### Macbook pro
cd ~/.bin
./litecoind

## 4. Install Ord
### Resources
See Readme
### Commands
cd bin
./ord index update

./ord server -j
./ord --bitcoin-rpc-user your_rpc_username --bitcoin-rpc-pass your_rpc_password server --http-port 8080 -j 

## Ord2
find $HOME/.local/share/ord -name "index.redb"
/root/.local/share/ord/index.redb


#### Macbook pro
cd /Users/indigo/dev/ord-litecoin-0.15/target/release
./ord --bitcoin-rpc-user your_rpc_username --bitcoin-rpc-pass your_rpc_password --http-port 8080 server -j 

## 5. GIT Clon project
git clone https://github.com/IndigoNakamoto/ordlite.io.git
username: indigonakamoto
password: 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


## 6. Setup Project

### a. Setup DB (Screen 1)
cd ordlite.io/backend
npm i 
cd docker
docker-compose up -d

// TODO: Update working memory and something else 
// TODO: docker exec -it docker-postgres-1 psql -U ord_lite_user -d ord_lite_db

### b. Sync Inscriptions (Screen 2)
cd ../app/setup/ 
npx ts-node inscription.ts
npx ts-node index.ts 
cd ../services/
npx ts-node InscriptionUpdateService.ts

### c. Start Servers (Screen 3)
/backend/



1. screen
    1. litecoind
    2. cd ~/.bin 
        1. ./ord --bitcoin-rpc-user your_rpc_username --bitcoin-rpc-pass your_rpc_password server -j
2. cd ordlite.io/backend/docker
    1. docker-compose up -d
    2. Docker ps
3. cd ordlite.io/backend/app/setup
    1. npx ts-node inscriptions.ts
    2. npx ts-node index.ts
    3. npx ts-node index.ts
    4. cd ../services
    5. npx ts-node InscriptionUpdateService.ts 
        1. NOTE: NANO and change to setInterval later



# Postgres 
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




#DEBUG
## terminal closes with terminals for servers:
sudo lsof -i :3000 -i :3005

kill <PID3000> <PID3005>


# Alter table - Add column
https://chat.openai.com/c/b9301642-7bfb-45eb-be03-3f3f6fe3e1951




ps aux | grep 'ts-node InscriptionUpdateService.ts'