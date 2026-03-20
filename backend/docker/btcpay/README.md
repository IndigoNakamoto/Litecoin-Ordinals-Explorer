# BTCPay Server (local / dev)

This repo does **not** embed the full BTCPay Docker generator (it is large and versioned upstream). Use the **official** deployment and point invoices/webhooks at this backend.

## Official install (recommended)

1. Follow [BTCPay Server — Docker Deployment](https://docs.btcpayserver.org/Docker/).
2. Clone [btcpayserver/btcpayserver-docker](https://github.com/btcpayserver/btcpayserver-docker) on the same machine (or VPS).
3. Configure environment before `btcpay-setup.sh`, for example:

   ```bash
   export BTCPAY_HOST="btcpay.local"          # or your LAN / DNS name
   export NBITCOIN_NETWORK="mainnet"          # or testnet / regtest as supported
   export BTCPAYGEN_CRYPTO1="ltc"             # Litecoin as first chain (see BTCPay docs for multi-coin)
   export BTCPAYGEN_REVERSEPROXY="nginx"      # or "none" for experiments
   ```

   For Litecoin alongside Bitcoin, see [Altcoins FAQ](https://docs.btcpayserver.org/FAQ/Altcoin).

4. Run the setup script from that repo (as documented upstream). Ensure **ports 80/443** (or your chosen reverse proxy) are available.

## Connect to this explorer backend

1. **Webhook URL:** expose your backend on a URL BTCPay can reach (e.g. `https://api.yourdev.tld/inscribe/webhook` — exact path must match your Express route).
2. **Secret:** set BTCPay webhook secret = same value you pass into `InscriptionService` / env as the HMAC key.
3. **Raw body:** verify BTCPay signatures using the **raw** POST body Express received (ordering/whitespace matters).

## Litecoin node relationship

- BTCPay can run its own NBXplorer/Litecoin stack **or** you connect to an external `litecoind`.
- Your **ord-litecoin** instance needs its **own** `litecoind` with **`-txindex=1`** for indexing; that can be the same machine as BTCPay’s node **only** if you plan networking and resource usage carefully (often separate datadirs / containers).

## Local-only shortcuts

- Use `/etc/hosts` or **mkcert** so `BTCPAY_HOST` resolves on your laptop.
- For pure regtest experiments, run **either** this repo’s `docker compose --profile litecoin` **or** BTCPay’s regtest setup—not both on conflicting ports—until you map clearly which service owns which RPC port.
