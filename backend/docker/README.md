# Docker stack

## Compose files in this repo

| File | Purpose |
|------|--------|
| **`docker-compose.yml`** | Primary dev DB (**Postgres on host `15432` by default**) and optional **`litecoin` profile** (`litecoind` + `ord-litecoin`). |
| **`test-docker-compose.yml`** | Secondary Postgres for tests (**host `5444`** → container `5432`), user/db `test` / `test`. Does **not** start Litecoin or ord. |

Each file sets a **different Compose project name** (`litecoin-ordinals-dev` vs `litecoin-ordinals-test`), so you never get two unrelated files fighting over the same container name (`docker-postgres-1`).

Compose file path is **`backend/docker/docker-compose.yml`**. Either `cd backend/docker` first, or from the **repo root**:

```bash
bash scripts/docker-explorer-compose.sh up -d postgres
```

```bash
# Main dev (Postgres only) — container like litecoin-ordinals-dev-postgres-1, host port 15432
docker compose -f docker-compose.yml up -d postgres

# Optional: regtest + ord (same file, extra services)
docker compose -f docker-compose.yml --profile litecoin up -d

# Test DB — container like litecoin-ordinals-test-postgres-1, host port 5444
docker compose -f test-docker-compose.yml up -d
```

**Data dirs:** main compose uses **`database/postgres_data`**; **`test-docker-compose.yml`** uses **`database/postgres_test_data`** so you can run dev and test Postgres **at the same time** without sharing one data directory.

**Backend `DATABASE_URL`:** use **`127.0.0.1:15432`** + `ord_lite_user` for dev, or **`127.0.0.1:5444`** + `test` only when you mean the test compose.

## Port map (this project’s published ports)

When **other** containers are already on your machine (BTCPay, another Postgres, etc.), avoid clashes:

| Host port | Service (main `docker-compose.yml`) |
|-----------|----------------------------------------|
| **15432** (default) | `postgres` — set **`EXPLORER_POSTGRES_PORT`** in `backend/docker/.env` if you need another host port |
| **8080** | `ord-litecoin` HTTP |
| **19443** | `litecoind` RPC (regtest) |
| **19444** | `litecoind` P2P (regtest) |
| **5444** | `postgres` in **`test-docker-compose.yml`** only |

BTCPay’s official stack typically wants **80/443** and its own Postgres/NBXplorer — run it as a **separate compose project** (different directory or `COMPOSE_PROJECT_NAME`) and point the explorer backend at your ord/LTC RPC URLs over the Docker bridge or `host.docker.internal`. See **`btcpay/README.md`**.

## Postgres (default)

From this directory:

```bash
docker compose up -d postgres
```

Database URL (matches default compose host port **15432**):

`postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:15432/ord_lite_db`

If you set `EXPLORER_POSTGRES_PORT` in **`backend/docker/.env`**, use that port in **`backend/.env`** → `DATABASE_URL` instead.

## Litecoin Core regtest + ord-litecoin (profile `litecoin`)

Runs a **local regtest** node (RPC **19443**) and **[ord-litecoin](https://github.com/ynohtna92/ord-litecoin)** with HTTP on **http://127.0.0.1:8080** (container port 80).

```bash
# First time (or after changing ORD_LITECOIN_GIT_REF): build ord from upstream source
docker compose --profile litecoin up -d --build
```

`--build` can be omitted on later starts if the `litecoin-ordinals-dev-ord-litecoin:*` image is already present.

- **First start:** ord builds its index against an empty regtest chain; this is quick. Mine blocks when you need spendable coins:

  ```bash
  docker compose exec litecoind litecoin-cli -datadir=/data -regtest -rpcuser=litecoin -rpcpassword=litecoin getnewaddress
  docker compose exec litecoind litecoin-cli -datadir=/data -regtest -rpcuser=litecoin -rpcpassword=litecoin generatetoaddress 101 "<address>"
  ```

  (`-datadir=/data` matches `LITECOIN_DATA` in `docker-compose.yml`; the image entrypoint appends this path — without it, `litecoin-cli` would look in `~/.litecoin` and miss the node’s regtest dir.)

  From the host, if `litecoin-cli` is installed with matching `-rpcport` / credentials, you can run the same commands against `127.0.0.1:19443`.

- **Litecoin Core log noise on first run:** messages like `Failed to open ... banlist.dat`, `peers.dat`, `mempool file`, `Invalid or missing ...; recreating` are **normal** on a fresh datadir. `Unable to bind to 127.0.0.1:19444` often appears when P2P already bound to `0.0.0.0:19444` inside the container — **harmless** for regtest if RPC (`19443`) is healthy.

- **Backend env:** copy `backend/docker/.env.example` values into `backend/.env` (or repo root `.env`). Use:
  - `ORD_LITECOIN_URL=http://127.0.0.1:8080`
  - `LITECOIN_RPC_PORT=19443` (regtest; mainnet default is **9332**)
  - `LITECOIN_RPC_USER` / `LITECOIN_RPC_PASS` = `litecoin` / `litecoin` for this compose stack

- **ord-litecoin image:** Compose **builds** from **[ynohtna92/ord-litecoin](https://github.com/ynohtna92/ord-litecoin)** using the repo’s `Dockerfile` (default git ref **`0.20.1-litecoin`**; override with **`ORD_LITECOIN_GIT_REF`** in `backend/docker/.env`). There is no reliance on third-party Docker Hub mirrors. **First `up --build`** compiles Rust (`cargo build --release`) — expect several minutes and high CPU; after that the tagged image is reused. On **Apple Silicon**, the binary is **native ARM64** inside the container. **`ORD_LITECOIN_GIT_REF`** is also used as the Docker **image tag**; prefer **tags or commit SHAs**, not branch names containing **`/`**.
- **`litecoind`:** no `platform:` pin; see `docker image inspect litecoinproject/litecoin-core:latest` for `Architecture` if you need to confirm amd64 vs arm64.

## Mainnet / testnet

Do **not** use this compose file for production mainnet without hardening (credentials, firewall, resource limits). For mainnet you would typically:

1. Run Litecoin Core with `-txindex=1`, sync the chain, secure RPC.
2. Point ord-litecoin at that node (`--litecoin-rpc-url`, and remove `--regtest`).
3. Set `LITECOIN_RPC_PORT` (e.g. **9332** mainnet) and `ORD_LITECOIN_URL` to your ord HTTP URL.

## BTCPay Server

BTCPay is **not** in this compose file (its official stack is multi-service). Follow **`btcpay/README.md`** to run BTCPay beside this project and connect webhooks to the backend.

## Troubleshooting

### You only have Postgres + `npm run dev` running

That is enough to hit **`GET /inscriptions`** from an **empty** DB or seeded data, but **not** for live ordinals content or **`npm run indexer`**. You also need **ord-litecoin** (and usually **litecoind**) for the `litecoin` profile, plus `ORD_LITECOIN_URL` / RPC vars in **`backend/.env`**. From **repo root**: `bash scripts/docker-explorer-compose.sh --profile litecoin up -d --build`.

### `scripts/docker-explorer-compose.sh: No such file or directory`

The helper lives under **`scripts/` at the repository root**. If your shell is in **`backend/docker`**, use `bash ../../scripts/docker-explorer-compose.sh …` or `cd` to the root first.

### Prisma: `DATABASE_URL` must start with `postgresql://`

Empty or typo’d URLs in **`backend/.env`** break `prisma migrate` / `generate`. Match compose:  
`postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:15432/ord_lite_db?schema=public`

### `open .../backend/docker-compose.yml: no such file or directory`

The file lives under **`backend/docker/`**, not `backend/`. Use `cd backend/docker`, or `bash scripts/docker-explorer-compose.sh` from the repo root.

### `Bind for 0.0.0.0:15432 failed: port is already allocated`

Something else is already publishing **15432** (often a leftover **`docker-postgres-1`** from an older compose project name).

```bash
docker ps --format '{{.Names}}\t{{.Ports}}' | grep 15432
```

- If it is an old explorer Postgres you no longer need: `docker rm -f docker-postgres-1` (data is in **`database/postgres_data`** on the host unless you removed it).
- If you must keep that container: pick another host port — in **`backend/docker/.env`** set e.g. `EXPLORER_POSTGRES_PORT=15434`, then put the same port in **`backend/.env`** → `DATABASE_URL`, and `docker compose ... up -d postgres` again.

Remove any stuck **`litecoin-ordinals-dev-postgres-1`** in `Created` state after a failed bind: `docker rm -f litecoin-ordinals-dev-postgres-1`.
