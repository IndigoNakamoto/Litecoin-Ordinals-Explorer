# Docker stack

## Postgres (default)

From this directory:

```bash
docker compose up -d postgres
```

Database URL (matches compose):

`postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:5432/ord_lite_db`

## Litecoin Core regtest + ord-litecoin (profile `litecoin`)

Runs a **local regtest** node (RPC **19443**) and **[ord-litecoin](https://github.com/ynohtna92/ord-litecoin)** with HTTP on **http://127.0.0.1:8080** (container port 80).

```bash
docker compose --profile litecoin up -d
```

- **First start:** ord builds its index against an empty regtest chain; this is quick. Mine blocks when you need spendable coins:

  ```bash
  docker compose exec litecoind litecoin-cli -regtest -rpcuser=litecoin -rpcpassword=litecoin getnewaddress
  docker compose exec litecoind litecoin-cli -regtest -rpcuser=litecoin -rpcpassword=litecoin generatetoaddress 101 "<address>"
  ```

  From the host, if `litecoin-cli` is installed with matching `-rpcport` / credentials, you can run the same commands against `127.0.0.1:19443`.

- **Backend env:** copy `backend/docker/.env.example` values into `backend/.env` (or repo root `.env`). Use:
  - `ORD_LITECOIN_URL=http://127.0.0.1:8080`
  - `LITECOIN_RPC_PORT=19443` (regtest; mainnet default is **9332**)
  - `LITECOIN_RPC_USER` / `LITECOIN_RPC_PASS` = `litecoin` / `litecoin` for this compose stack

- **Image note:** `fiftysix/ord-litecoin:0.20.1` is **linux/amd64**. On Apple Silicon, Docker uses QEMU (slower) or build an **arm64** image from [ynohtna92/ord-litecoin](https://github.com/ynohtna92/ord-litecoin) and replace the `image:` in `docker-compose.yml`.

## Mainnet / testnet

Do **not** use this compose file for production mainnet without hardening (credentials, firewall, resource limits). For mainnet you would typically:

1. Run Litecoin Core with `-txindex=1`, sync the chain, secure RPC.
2. Point ord-litecoin at that node (`--litecoin-rpc-url`, and remove `--regtest`).
3. Set `LITECOIN_RPC_PORT` (e.g. **9332** mainnet) and `ORD_LITECOIN_URL` to your ord HTTP URL.

## BTCPay Server

BTCPay is **not** in this compose file (its official stack is multi-service). Follow **`btcpay/README.md`** to run BTCPay beside this project and connect webhooks to the backend.
