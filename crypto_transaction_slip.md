# Crypto Transaction Slip – UI Logic & Field Mapping

This document defines the UI labels, display rules, and field mappings for all crypto transactions in the mobile app. The slip dynamically updates text, labels, and fields based on the scenario and API response.

## Supported Crypto Scenarios
1. crypto_buy
2. crypto_sell
3. crypto_send
4. crypto_receive
5. crypto_withdrawal

## Global Display Rules
- Avoid hard-coded labels like “Sender”, “Receiver”, or “From Bitcoin”.
- Use `display_party.identifier` for user or external identifiers.
- Use `crypto_details.icon_url` for the token icon.
- Use `transaction_status` for Completed/Pending/Failed.

## Scenario-Wise Logic

### 1. CRYPTO BUY
**Title:** Bought {token}  
**Amount:** {final_amount} {currency}  

**Fields Shown:**
- Purchase Date — created_at  
- Purchase Time — created_at  
- Order ID — transaction_id  
- Asset Purchased — crypto_details.token  
- Paid In — crypto_details.from_currency  
- Received — final_amount + currency  
- Exchange Rate — crypto_details.exchange_rate  
- USD Value — crypto_details.usd_value  

**Hidden:**
Sender, Receiver, Addresses, Network, Tx Hash

---

### 2. CRYPTO SELL
**Title:** Sold {token}  
**Amount:** {final_amount} USD  

**Fields Shown:**
- Sale Date — created_at  
- Sale Time — created_at  
- Order ID — transaction_id  
- Asset Sold — crypto_details.from_currency  
- Received — final_amount USD  
- Exchange Rate — crypto_details.exchange_rate  
- USD Value — crypto_details.usd_value  

**Hidden:** Sender, Receiver, Address fields

---

### 3. CRYPTO SEND
**Title:** Sent {token}  
**Amount:** {amount} {currency}  
**Subtitle:** To {display_party.identifier}

**Fields Shown:**
- Sent To — display_party.identifier  
- Network — crypto_details.network  
- From Address — crypto_details.from_address  
- To Address — crypto_details.to_address  
- Tx Hash — crypto_details.tx_hash  
- USD Value — crypto_details.usd_value  
- Fee — fee.amount  

---

### 4. CRYPTO RECEIVE
**Title:** Received {token}  
**Amount:** {amount} {currency}  
**Subtitle:** From {display_party.identifier}

**Fields Shown:**
- Received From — display_party.identifier  
- Network — crypto_details.network  
- From Address — crypto_details.from_address  
- To Address — crypto_details.to_address  
- Tx Hash — crypto_details.tx_hash  
- USD Value — crypto_details.usd_value  

---

### 5. CRYPTO WITHDRAWAL
**Title:** Withdrawn {token}  
**Amount:** {amount} {currency}  
**Subtitle:** To External Wallet or {display_party.identifier}

**Fields Shown:**
- Withdrawn To — display_party.identifier  
- Network — crypto_details.network  
- From Address — crypto_details.from_address  
- To Address — crypto_details.to_address  
- USD Value — crypto_details.usd_value  

---

## Scenario → Display Mapping Table

| Scenario | Title | Subtitle | Amount | Key Fields |
|---------|--------|----------|---------|------------|
| Buy | Bought BTC | — | Crypto received | exchange_rate, usd_value, paid_in |
| Sell | Sold BTC | — | Fiat received | exchange_rate, usd_value |
| Send | Sent BTC | To identifier | Crypto sent | network, addresses, tx_hash |
| Receive | Received BTC | From identifier | Crypto received | network, addresses, tx_hash |
| Withdrawal | Withdrawn BTC | To external wallet | Crypto sent | network, addresses |

