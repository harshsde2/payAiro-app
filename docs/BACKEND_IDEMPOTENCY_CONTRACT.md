# Idempotency-Key contract (backend)

The mobile app now sends an `Idempotency-Key` header on every money-movement request.
**Nothing is required of the backend for the app to work** — the client-side guard is
self-sufficient today. Implementing this contract adds a second, server-side guarantee
that survives cases the client cannot cover (app killed mid-request, OS-level retry,
a reinstall).

## Header

```
Idempotency-Key: 8f14e45f-ea0c-4a1b-9d3f-2b6c1a7e5d90
```

A UUID-v4. It identifies a **transaction intent**, not a request. Every retry of the
same intent — an automatic one, a user re-tap, a replay after a token refresh — carries
the **same** key. A different amount, recipient, or asset produces a **different** key.

## Endpoints

| Endpoint | Flow |
|---|---|
| `POST api/v1/payment-transactions/send/` | Send crypto (internal + external) |
| `POST api/v1/integrations/coinme/trade/execute/` | Buy, sell, withdraw (card rail) |
| `POST api/v1/integrations/coinme/order-template/` | Add balance / cash buy |
| `POST api/v1/integrations/coinme/cash-offramp/execute/` | Sell for cash (off-ramp) |
| `POST api/v1/payment-transactions/request/{id}/pay/` | Pay a crypto request |

## Required behaviour

1. **Scope the key per user.** Dedupe on `(user_id, idempotency_key)`. Keys are generated
   client-side and are not globally unique by contract.

2. **First request wins.** Process it normally and store the response body + status
   against the key.

3. **A repeat of a completed key returns the stored response.** Do **not** create a
   second transaction. Return the original response as-is (same status, same body) so
   the client renders the original result. Returning `409 Conflict` with the original
   transaction id is also acceptable — the client treats a 409 on these endpoints as
   "already submitted", never as a failure to retry.

4. **A repeat while the first is still in flight returns `409 Conflict`.** The client
   surfaces this as "already processing" and does not retry.

5. **Retain keys for at least 24 hours.** The client's own duplicate window is 90
   seconds; the backend window is what covers app restarts and long outages.

6. **A missing key keeps the current behaviour.** This must roll out backward
   compatibly — the app ships the header before the backend understands it, and older
   app versions will never send it.

## Explicitly not required

- Validating the key format. Treat it as an opaque string (max 128 chars).
- Deduping `GET`s or any read endpoint.

## Why this matters

Without server-side dedupe there is one hole the client provably cannot close: a request
that reaches the backend and is processed, but whose response never arrives (timeout,
process death, connection reset). The client cannot distinguish that from "never
arrived", so it has to assume the worst and ask the user to check their Activity rather
than offering a retry. With this contract, a retry becomes safe and that dead end
disappears.

## Client-side references

- `src/services/transactionGuard.ts` — intent signatures, key lifecycle, duplicate window
- `src/hooks/useTransactionSubmit.ts` — the wrapper every money submit goes through
- `src/utils/idempotency.ts` — key generation and intent-signature building
