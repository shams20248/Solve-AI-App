# BNB Wallet Integration

The app now exposes a non-custodial BNB payment configuration using the public treasury address supplied by the owner:

`0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b`

## Endpoints

- `GET /api/wallet/config` — public network and destination details.
- `GET /api/wallet/account` — authenticated internal BNB ledger summary.
- `POST /api/wallet/payment-intent` — authenticated payment intent using `{ "amount": 0.01, "reference": "order-123" }`.

## Configuration

Set these values in `.env`:

```dotenv
BNB_NETWORK=BSC
BNB_TREASURY_ADDRESS=0xbd6afb2ed14af73c70f2a167f60622f2c6e13f2b
```

For testing, use `BNB_NETWORK=BSC_TESTNET` and a testnet treasury address instead. Never commit private keys, seed phrases, or exchange API secrets.

## Important production note

The payment-intent endpoint does **not** claim a blockchain deposit as confirmed. A production release must add a trusted BNB Smart Chain indexer/webhook, verify the transaction hash, destination address, token/native asset, amount, confirmations, chain ID, and replay protection before crediting a user wallet or subscription.
