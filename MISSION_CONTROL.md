# Mission control — Litecoin Ordinals Explorer revival

Living checklist for bringing the explorer back to production. Update the **Decision log** when you change direction.

## North star

The explorer is **Prisma + PostgreSQL** for indexed data, **`ord-litecoin` over HTTP** for ordinal content and chain-adjacent reads, and **BTCPay Server** for the optional user inscriber path. Sequelize models remain **transitional** until fully migrated away.

### Chain stack order (default)

**Production-like local work:** **Litecoin Core mainnet first**, then **ord-litecoin**.

1. Run **`litecoind-mainnet`** (compose profile **`litecoin-mainnet`**) and let **IBD** progress — headers, then blocks — with **`-txindex=1`** (large disk and time). RPC **9332**.
2. When the node is reliably answering RPC (sync can still be in progress), start **`ord-litecoin-mainnet`** so ord can index against that node. HTTP defaults to **8081** on the host.
3. Point **`backend/.env`** at that stack: **`ORD_LITECOIN_URL=http://127.0.0.1:8081`**, **`LITECOIN_RPC_PORT=9332`**, same **`LITECOIN_RPC_USER` / `LITECOIN_RPC_PASS`** as compose for dev.

**Fast iteration (no mainnet IBD):** profile **`litecoin`** — **regtest** `litecoind` (**19443**) + **ord** on **8080**. Details: **`backend/docker/README.md`**.

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

### Indexer

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
| — | *Add rows as you decide (e.g. “Prisma is system of record for explorer data.”)* |
