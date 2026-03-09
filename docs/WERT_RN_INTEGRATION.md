# Wert RN Integration Contract

This app integrates Wert Fiat Onramp through a backend session API and a WebView checkout bridge.

## 1) Backend Session Endpoint

- Route: `POST /api/auth/wert-hpp-session/`
- Auth: app bearer token (same as existing protected APIs)
- Request body:

```json
{
  "amount": 100.5,
  "currency": "USD",
  "commodity": "USDC",
  "network": "polygon",
  "wallet_address": "0x..."
}
```

- Response body (recommended):

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "session_id": "608d23d1-fdcd-488a-8145-a99f8ed0cafe",
    "request_id": "0d476e83a662ac65c67eca36165e6373",
    "checkout_page_url": "https://<partner-domain>/wert/checkout?sid=<session_id>",
    "origin": "https://sandbox.wert.io",
    "expires_in": 30
  }
}
```

Notes:
- `session_id` is short-lived and one-time-use. Open checkout immediately.
- Keep Wert `X-Api-Key` on backend only.

## 2) RN App Runtime Flow

1. User taps Add Balance payment option.
2. App calls `auth/wert-hpp-session/`.
3. App opens `checkout_page_url` in WebView.
4. Web page posts events to RN with `window.ReactNativeWebView.postMessage(...)`.
5. RN updates UI on `payment-status` and closes or shows error.
6. Final order state is read from backend/webhook persistence.

## 3) WebView Bridge Event Format

Checkout page should post JSON messages:

```json
{ "type": "loaded" }
```

```json
{ "type": "payment-status", "data": { "status": "pending" } }
```

```json
{ "type": "payment-status", "data": { "status": "success", "order_id": "..." } }
```

```json
{ "type": "payment-status", "data": { "status": "failed", "message": "..." } }
```

```json
{ "type": "close" }
```

```json
{ "type": "error", "data": { "message": "..." } }
```

## 4) Webhook Requirements

- Add endpoint: `POST /webhooks/wert/`
- Return HTTP `2xx` in under 5 seconds.
- Process payload asynchronously and persist state.
- Persist and reconcile at minimum:
  - `payment_started`
  - `order_complete`
  - `order_failed`
  - `order_cancelled`
  - `transfer_started`

## 5) Sandbox Test Matrix

- Launch checkout with minimum amount.
- Complete success purchase.
- Trigger failed payment.
- Cancel/close checkout manually.
- Validate app restart still shows correct final state from backend.
- Validate expired `session_id` gracefully prompts retry (create new session).

