# Mission control — Litecoin Ordinals Explorer revival

Living checklist for bringing the explorer back to production. Update the **Decision log** when you change direction.

## North star

The explorer is **Prisma + PostgreSQL** for indexed data, **`ord-litecoin` over HTTP** for ordinal content and chain-adjacent reads, and **BTCPay Server** for the optional user inscriber path. Sequelize models remain **transitional** until fully migrated away.

### Chain stack order (default)

**Production-like local work:** **Litecoin Core mainnet first**, then **ord-litecoin**, then **backend + optional Postgres indexer**.

**Three layers (don’t confuse them):**

| Layer | What it is | Filled by |
|--------|------------|-----------|
| **1. Chain** | Litecoin block files + indexes on disk | **`litecoind-mainnet`** (IBD) |
| **2. Ord** | Ord’s own index + HTTP API | **`ord-litecoin-mainnet`** (follows the node; can lag IBD) |
| **3. Explorer DB** | **`Inscription`** rows etc. in Postgres | **`cd backend && npm run indexer`** ([`prismaInscriptionUpdater.ts`](backend/src/prismaInscriptionUpdater.ts)) reading ord — **not** automatic when you open the UI |

1. Run **`litecoind-mainnet`** (compose profile **`litecoin-mainnet`**) and let **IBD** progress — headers, then blocks — with **`-txindex=1`** (large disk and time). RPC **9332**.
2. When the node is far enough along (or RPC is stable), start **`ord-litecoin-mainnet`** so ord can build **layer 2**. HTTP defaults to **8081** on the host.
3. Point **`backend/.env`** at **layer 2 + RPC**: **`ORD_LITECOIN_URL=http://127.0.0.1:8081`**, **`LITECOIN_RPC_PORT=9332`**, same **`LITECOIN_RPC_USER` / `LITECOIN_RPC_PASS`** as compose for dev.
4. Run the API (`npm run dev`) and app as usual; optional **gates** (`health-check`, `verify-inscription-gate`) once ord answers.
5. To populate **layer 3** (list/search in the explorer backed by Prisma): **`npm run indexer`** with **`DATABASE_URL`** set and migrations applied. Re-run or schedule as needed.

**Fast iteration (no mainnet IBD):** profile **`litecoin`** — **regtest** `litecoind` (**19443**) + **ord** on **8080**. Details: **`backend/docker/README.md`**. If you only care about mainnet, stop the **`litecoin`** profile services to save CPU/RAM.

### Current focus & next steps (edit as you go)

_Use this block as a living status; update checkboxes when your machine matches._

- [ ] **Mainnet Core** (`litecoind-mainnet`): IBD in progress or complete.
- [ ] **Mainnet ord** (`ord-litecoin-mainnet`): started after step above; `/status` healthy on **8081** (or custom port).
- [ ] **`backend/.env`**: `ORD_LITECOIN_URL` + **`LITECOIN_RPC_PORT=9332`** aligned with mainnet stack.
- [ ] **Postgres** + **`prisma migrate deploy`** against dev DB.
- [ ] **`npm run indexer`**: filling **`Inscription`** for the explorer list API.
- [ ] **Regtest stack** (`litecoin` profile): stopped if unused, to avoid two Core + ord pairs on one machine.

---

## Revival checklist

### Dependencies and toolchain

- [ ] Pin Node LTS; run `npm audit` in `backend/` and `frontend/`.
- [ ] Confirm Prisma version strategy (`^5.10.x` today) and regenerate client after schema edits.

### ORM and schema

- [x] **Inscription reads** use Prisma ([`backend/app/controllers/inscriptions.ts`](backend/app/controllers/inscriptions.ts)); **indexer** uses [`npm run indexer`](backend/package.json) → [`backend/src/prismaInscriptionUpdater.ts`](backend/src/prismaInscriptionUpdater.ts).
- [ ] Resolve remaining **Sequelize** usage (other models / legacy routes).
- [x] Revival migration applied: [`backend/prisma/migrations/20260320120000_revival_full_schema`](backend/prisma/migrations/20260320120000_revival_full_schema) (drops legacy `inscriptions` / `update_progress`, creates full `schema.prisma` layout). **Warning:** destructive on existing dev DB; re-run only on disposable DBs.
- [ ] Align **`Invoice` / `InscribeStatus`** semantics between BTCPay flow and Prisma `Invoice` model.

### Migrations and database

- [ ] `cd backend && npx prisma migrate status` against real `DATABASE_URL`.
- [ ] Document **`DATABASE_URL`** for local Docker (default **host port 15432**, not 5432):  
  `postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:15432/ord_lite_db` — override with **`EXPLORER_POSTGRES_PORT`** in `backend/docker/.env` if needed (see `backend/docker/README.md`).
- [ ] Know which compose file you use: **`backend/docker/docker-compose.yml`** (main + optional `litecoin`) vs **`backend/docker/test-docker-compose.yml`** (Postgres on **5444**). Port and stack layout: **`backend/docker/README.md`**.

### Litecoin mainnet + ord-litecoin (preferred path)

- [ ] Start **mainnet node only** until you are ready for ord:  
  `docker compose -f backend/docker/docker-compose.yml --profile litecoin-mainnet up -d litecoind-mainnet`  
  (see **`backend/docker/README.md`** — ports **9332/9333**, volume **`litecoin_mainnet`**).
- [ ] After RPC is stable, start **ord**:  
  `docker compose -f backend/docker/docker-compose.yml --profile litecoin-mainnet up -d ord-litecoin-mainnet`  
  (or `up -d` for the full profile). Ord HTTP default: **8081**.
- [ ] Set **`ORD_LITECOIN_URL=http://127.0.0.1:8081`** (or your **`LITECOIN_MAINNET_ORD_HTTP_PORT`**) and **`LITECOIN_RPC_PORT=9332`** (+ user/pass matching compose).

### Regtest shortcut (optional)

- [ ] For **regtest** only: `docker compose -f backend/docker/docker-compose.yml --profile litecoin up -d` — **`ORD_LITECOIN_URL=http://127.0.0.1:8080`**, **`LITECOIN_RPC_PORT=19443`**.

### Gates

- [ ] Confirm **`scripts/verify-inscription-gate.sh`** passes once **ord** is up (set **`ORD_LITECOIN_URL`** for **8080** or **8081** accordingly; script also reads **`backend/docker/.env`**).

### BTCPay

- [ ] Run BTCPay via the **official** [btcpayserver-docker](https://github.com/btcpayserver/btcpayserver-docker) flow; see **`backend/docker/btcpay/README.md`** for env pointers, webhooks, and how it relates to `litecoind` / ord.
- [ ] Webhook URL + secret in BTCPay; Express uses **raw body** for signature verification where needed.
- [ ] Implement or remove **stub** branches: `handleInvoiceSettled`, `subscribeToWebhook` base URL, full event matrix.

### Indexer (Postgres / layer 3)

- [ ] With **mainnet ord** up and **`backend/.env`** pointing at **8081** + **9332**, run **`cd backend && npm run indexer`** to backfill **`Inscription`** (and progress in **`UpdateProgress`**).
- [ ] Use **`UpdateProgress`** (or a single documented strategy) for “last processed block/page,” not only max `inscription_number`.
- [ ] Run indexer against a test DB and verify row counts / samples.

### User inscription pipeline

- [ ] Implement **`inscribeFiles`** (or formally disable inscriber UI) and reconcile **`File`** / invoice linking with Prisma if that’s the target.

---

## Verification gate (protocol / indexer)

**Before merging changes** to any of:

- `backend/app/utils/ord-litecoin.ts`, `backend/util/ord-litecoin.ts`
- `backend/src/prismaInscriptionUpdater.ts`
- `backend/prisma/schema.prisma`, `backend/prisma/migrations/**`
- `backend/app/services/InscribeService.ts`

you must run:

```bash
bash scripts/health-check.sh
bash scripts/verify-inscription-gate.sh
```

Optional: `VERIFY_INSCRIPTION_ID=<inscription_id> bash scripts/verify-inscription-gate.sh` for a deeper ord-litecoin check.

### Gate semantics

| Script | Purpose |
|--------|--------|
| `health-check.sh` | Docker **`postgres`** service + Prisma can reach DB (`SELECT 1`). |
| `verify-inscription-gate.sh` | **`prisma validate`**, ord-litecoin **`/status`** or **`/inscriptions/block/0/0`**, optional inscription fetch. |

If ord-litecoin is intentionally down, do not merge protocol changes until the service is up or the gate is updated with team agreement (note in Decision log).

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-03-20 | **Mainnet-first chain stack:** default workflow is **`litecoin-mainnet`** — sync **Litecoin Core mainnet** (`litecoind-mainnet`), then **ord** (`ord-litecoin-mainnet`). Regtest profile **`litecoin`** remains for quick dev. Documented in **`backend/docker/README.md`** and **`.cursor/rules/ops.mdc`**. |
| 2026-03-20 | **Three layers:** explorer list data lives in **Postgres** via **`npm run indexer`**; ord holds its own index; Core holds the chain. Opening the UI does not replace the indexer. |
| — | *Add rows as you decide (e.g. “Prisma is system of record for explorer data.”)* |
