# PayAiro Transaction API - Unified Response Structure

> **Version:** 1.0.0  
> **Last Updated:** November 28, 2025  
> **Author:** PayAiro Frontend Team  
> **For:** Backend Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Master Transaction Response Structure](#master-transaction-response-structure)
4. [Transaction Types Enum](#transaction-types-enum)
5. [Status Types](#status-types)
6. [Example Responses by Scenario](#example-responses-by-scenario)
   - [Fiat Send (P2P)](#1️⃣-fiat-send-p2p)
   - [Fiat Receive (P2P)](#2️⃣-fiat-receive-p2p)
   - [External Bank Transfer Out](#3️⃣-external-bank-transfer-out)
   - [Debit Card Transaction](#4️⃣-debit-card-transaction)
   - [Merchant Refund](#5️⃣-merchant-refund)
   - [Crypto Buy](#6️⃣-crypto-buy)
   - [Crypto Sell](#7️⃣-crypto-sell)
   - [Crypto Send (P2P)](#8️⃣-crypto-send-p2p)
   - [Crypto Receive (P2P)](#9️⃣-crypto-receive-p2p)
   - [Crypto Withdrawal](#🔟-crypto-withdrawal-to-external-wallet)
7. [Migration Mapping](#migration-mapping-old--new)
8. [API Rules for Backend](#api-rules-for-backend)

---

## Overview

This document defines the unified API response structure for all transaction types in the PayAiro application. The goal is to provide a **consistent, scalable, and flexible** JSON structure that works across:

- **Fiat Transactions:** send, receive, merchant refund, external bank transfer, debit card transaction, merchant payment
- **Crypto Transactions:** buy, sell, send, receive, withdrawal, deposit, swap

### Current Problem

Currently, the same transaction returns different structures from different endpoints:

**From Dashboard API:**
```json
{
    "amount": 12,
    "category": "miscellaneous",
    "currency": "USD",
    "final_amount": "10",
    "id": "91f4caf9-9345-4598-b0a0-e5146217a41a",
    "note": null,
    "order_id": null,
    "recipient": "c@yopmail.com",
    "recipient_profile_photo": "null",
    "recipient_username": "Badboy",
    "sender": "cybridtesting1001@yopmail.com",
    "sender_profile_photo": "null",
    "sender_username": "prastu25qw",
    "status": "success",
    "timestamp": "2025-11-17T09:25:36.245220Z"
}
```

**From Transaction API:**
```json
{
    "amount": "12",
    "category": "miscellaneous",
    "created_at": "2025-11-17T14:55:36.245220+05:30",
    "description": null,
    "final_amount": "10",
    "id": 18,
    "note": null,
    "recipient_profile_photo": null,
    "recipient_username": "Badboy",
    "recipient_wallet_public_key": "0xAe216faa113b968374c500e5a349DEfc3049DAAA",
    "sender_profile_photo": null,
    "sender_username": "prastu25qw",
    "sender_wallet_public_key": "0xCb25fEEC40fD800911DD2c89734Bd7fd01dA3B40",
    "status": "success",
    "Transaction_fee_persentage": null,
    "transaction_id": "91f4caf9-9345-4598-b0a0-e5146217a41a"
}
```

**Issues:**
- Inconsistent field names (`timestamp` vs `created_at`)
- Different ID fields (`id` vs `transaction_id`)
- Type inconsistencies (`amount: 12` vs `amount: "12"`)
- `"null"` string vs actual `null`
- Missing fields in different endpoints

---

## Design Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Consistent naming** | Use `snake_case` throughout all field names |
| 2 | **Single source of truth** | Same response structure from ALL endpoints (dashboard, transaction details, history) |
| 3 | **Null over missing** | Always include all fields, use `null` for empty values (never `"null"` string) |
| 4 | **Type-first design** | `transaction_type` determines which conditional fields are populated |
| 5 | **ISO 8601 timestamps** | All dates in `YYYY-MM-DDTHH:mm:ss.SSSZ` format (UTC) |
| 6 | **Amounts as strings** | Preserve decimal precision by returning amounts as strings |
| 7 | **Computed display fields** | Backend computes `direction` and `display_party` for frontend simplicity |

---

## Master Transaction Response Structure

```json
{
  // ==============================
  // CORE FIELDS (Required for ALL transactions)
  // ==============================
  "transaction_id": "uuid-v4-string",           // Primary identifier (UUID v4)
  "transaction_type": "string",                  // Enum: see Transaction Types below
  "transaction_category": "fiat" | "crypto",     // High-level category
  "status": "string",                            // Enum: "pending" | "success" | "failed" | "cancelled" | "processing"
  "amount": "string",                            // Original amount as string (preserves precision)
  "final_amount": "string",                      // Amount after fees
  "currency": "string",                          // Currency code (USD, BTC, ETH, USDT, etc.)
  "currency_symbol": "string",                   // Display symbol ($, ₿, Ξ, etc.)
  "created_at": "ISO-8601-timestamp",            // When transaction was created
  "updated_at": "ISO-8601-timestamp",            // Last status update
  
  // ==============================
  // FEE INFORMATION
  // ==============================
  "fee": {
    "amount": "string",                          // Fee amount
    "percentage": "string",                      // Fee percentage (e.g., "2.5")
    "currency": "string"                         // Fee currency
  },
  
  // ==============================
  // SENDER INFORMATION (null for buy/deposit transactions)
  // ==============================
  "sender": {
    "user_id": "string",                         // Internal user ID
    "username": "string",                        // Display username
    "email": "string",                           // Email address
    "profile_photo": "string | null",            // Profile image URL
    "wallet_address": "string | null",           // Crypto wallet address (for crypto transactions)
    "bank_name": "string | null",                // Bank name (for bank transfers)
    "account_number_masked": "string | null"     // Masked account number (e.g., "****2231")
  },
  
  // ==============================
  // RECIPIENT INFORMATION (null for sell/withdrawal to self)
  // ==============================
  "recipient": {
    "user_id": "string | null",                  // Internal user ID (null for external)
    "username": "string | null",                 // Display username
    "email": "string | null",                    // Email address
    "profile_photo": "string | null",            // Profile image URL
    "wallet_address": "string | null",           // Crypto wallet address
    "bank_name": "string | null",                // Bank name
    "account_number_masked": "string | null"     // Masked account number
  },
  
  // ==============================
  // TRANSACTION DIRECTION (for UI display)
  // ==============================
  "direction": "outgoing" | "incoming",          // From current user's perspective
  "display_party": {                             // The "other" party to show in UI
    "username": "string",
    "profile_photo": "string | null",
    "identifier": "string"                       // Could be username, email, or wallet
  },
  
  // ==============================
  // CRYPTO-SPECIFIC FIELDS (null for fiat)
  // ==============================
  "crypto_details": {
    "from_currency": "string | null",            // Source crypto currency
    "to_currency": "string | null",              // Target crypto currency  
    "network": "string | null",                  // Blockchain network (ETH, TRX, BSC)
    "tx_hash": "string | null",                  // On-chain transaction hash
    "from_address": "string | null",             // Source wallet address
    "to_address": "string | null",               // Destination wallet address
    "token": "string | null",                    // Token symbol
    "icon_url": "string | null",                 // Token icon URL
    "exchange_rate": "string | null",            // Rate at time of transaction
    "usd_value": "string | null"                 // USD equivalent at time of transaction
  },
  
  // ==============================
  // BANK TRANSFER SPECIFIC (null for non-bank)
  // ==============================
  "bank_details": {
    "bank_name": "string | null",
    "bank_logo": "string | null",
    "account_type": "string | null",             // checking, savings
    "routing_number_masked": "string | null",
    "account_number_masked": "string | null",
    "transfer_method": "string | null"           // ACH, wire, instant
  },
  
  // ==============================
  // MERCHANT SPECIFIC (null for P2P)
  // ==============================
  "merchant_details": {
    "merchant_id": "string | null",
    "merchant_name": "string | null",
    "merchant_logo": "string | null",
    "order_id": "string | null",
    "invoice_number": "string | null",
    "description": "string | null"
  },
  
  // ==============================
  // CARD TRANSACTION SPECIFIC (null for non-card)
  // ==============================
  "card_details": {
    "card_id": "string | null",
    "card_last_four": "string | null",
    "card_brand": "string | null",               // visa, mastercard, etc.
    "card_type": "string | null",                // debit, credit
    "authorization_code": "string | null"
  },
  
  // ==============================
  // USER METADATA
  // ==============================
  "note": "string | null",                       // User-added note
  "category": "string | null",                   // family_friends, self_transfer, merchant, miscellaneous
  "tags": ["string"],                            // User tags for categorization
  
  // ==============================
  // REFUND/REVERSAL INFO (if applicable)
  // ==============================
  "refund_details": {
    "original_transaction_id": "string | null",
    "refund_reason": "string | null",
    "refunded_at": "ISO-8601-timestamp | null"
  }
}
```

---

## Transaction Types Enum

```typescript
type TransactionType = 
  // FIAT TRANSACTIONS
  | "fiat_send"                    // P2P send to another PayAiro user
  | "fiat_receive"                 // P2P receive from another PayAiro user
  | "fiat_deposit"                 // Add money from external source
  | "fiat_withdrawal"              // Withdraw to external bank
  | "fiat_bank_transfer_in"        // External bank transfer (incoming)
  | "fiat_bank_transfer_out"       // External bank transfer (outgoing)
  | "fiat_card_deposit"            // Debit card deposit
  | "fiat_card_purchase"           // Debit card purchase
  | "fiat_merchant_payment"        // Payment to merchant
  | "fiat_merchant_refund"         // Refund from merchant
  
  // CRYPTO TRANSACTIONS  
  | "crypto_buy"                   // Buy crypto with fiat
  | "crypto_sell"                  // Sell crypto for fiat
  | "crypto_send"                  // Send crypto to another user
  | "crypto_receive"               // Receive crypto from another user
  | "crypto_withdrawal"            // Withdraw crypto to external wallet
  | "crypto_deposit"               // Deposit crypto from external wallet
  | "crypto_swap";                 // Swap between cryptocurrencies
```

---

## Status Types

| Status | Description | UI Color |
|--------|-------------|----------|
| `pending` | Transaction initiated, waiting for processing | Orange/Yellow |
| `processing` | Transaction is being processed | Orange/Yellow |
| `success` | Transaction completed successfully | Green |
| `complete` | Transaction completed successfully (alias for success) | Green |
| `failed` | Transaction failed | Red |
| `cancelled` | Transaction was cancelled by user or system | Gray |

---

## Example Responses by Scenario

### 1️⃣ Fiat Send (P2P)

**Scenario:** User sends money to another PayAiro user

```json
{
  "transaction_id": "91f4caf9-9345-4598-b0a0-e5146217a41a",
  "transaction_type": "fiat_send",
  "transaction_category": "fiat",
  "status": "success",
  "amount": "12.00",
  "final_amount": "10.00",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2025-11-17T09:25:36.245220Z",
  "updated_at": "2025-11-17T09:25:38.123456Z",
  
  "fee": {
    "amount": "2.00",
    "percentage": "16.67",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_123",
    "username": "prastu25qw",
    "email": "cybridtesting1001@yopmail.com",
    "profile_photo": null,
    "wallet_address": "0xCb25fEEC40fD800911DD2c89734Bd7fd01dA3B40",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_456",
    "username": "Badboy",
    "email": "c@yopmail.com",
    "profile_photo": null,
    "wallet_address": "0xAe216faa113b968374c500e5a349DEfc3049DAAA",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "outgoing",
  "display_party": {
    "username": "Badboy",
    "profile_photo": null,
    "identifier": "Badboy"
  },
  
  "crypto_details": null,
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": null,
  "category": "miscellaneous",
  "tags": [],
  "refund_details": null
}
```

---

### 2️⃣ Fiat Receive (P2P)

**Scenario:** User receives money from another PayAiro user

```json
{
  "transaction_id": "a2b3c4d5-1234-5678-90ab-cdef12345678",
  "transaction_type": "fiat_receive",
  "transaction_category": "fiat",
  "status": "success",
  "amount": "5015.00",
  "final_amount": "5015.00",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2024-05-30T10:23:00.000000Z",
  "updated_at": "2024-05-30T10:23:02.000000Z",
  
  "fee": {
    "amount": "0.00",
    "percentage": "0",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_789",
    "username": "Dennis",
    "email": "dennis@example.com",
    "profile_photo": "https://cdn.payairo.com/users/dennis.jpg",
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_current",
    "username": "frances_swann",
    "email": "frances@example.com",
    "profile_photo": "https://cdn.payairo.com/users/francis.jpg",
    "wallet_address": null,
    "bank_name": "Chase Bank",
    "account_number_masked": "*****2231"
  },
  
  "direction": "incoming",
  "display_party": {
    "username": "Dennis",
    "profile_photo": "https://cdn.payairo.com/users/dennis.jpg",
    "identifier": "Dennis"
  },
  
  "crypto_details": null,
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": null,
  "category": "family_friends",
  "tags": [],
  "refund_details": null
}
```

---

### 3️⃣ External Bank Transfer Out

**Scenario:** User withdraws money to their external bank account

```json
{
  "transaction_id": "bank-tx-001",
  "transaction_type": "fiat_bank_transfer_out",
  "transaction_category": "fiat",
  "status": "success",
  "amount": "1000.00",
  "final_amount": "997.50",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2025-11-20T14:30:00.000000Z",
  "updated_at": "2025-11-20T14:32:00.000000Z",
  
  "fee": {
    "amount": "2.50",
    "percentage": "0.25",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": null,
  
  "direction": "outgoing",
  "display_party": {
    "username": "Chase Bank",
    "profile_photo": "https://cdn.payairo.com/banks/chase.png",
    "identifier": "External Bank"
  },
  
  "crypto_details": null,
  
  "bank_details": {
    "bank_name": "Chase Bank",
    "bank_logo": "https://cdn.payairo.com/banks/chase.png",
    "account_type": "checking",
    "routing_number_masked": "****1234",
    "account_number_masked": "*****7890",
    "transfer_method": "ACH"
  },
  
  "merchant_details": null,
  "card_details": null,
  
  "note": "Transfer to savings",
  "category": "self_transfer",
  "tags": ["savings"],
  "refund_details": null
}
```

---

### 4️⃣ Debit Card Transaction

**Scenario:** User makes a purchase using their PayAiro debit card

```json
{
  "transaction_id": "card-tx-001",
  "transaction_type": "fiat_card_purchase",
  "transaction_category": "fiat",
  "status": "success",
  "amount": "45.99",
  "final_amount": "45.99",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2025-11-25T09:15:00.000000Z",
  "updated_at": "2025-11-25T09:15:02.000000Z",
  
  "fee": {
    "amount": "0.00",
    "percentage": "0",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": null,
  
  "direction": "outgoing",
  "display_party": {
    "username": "Starbucks",
    "profile_photo": "https://cdn.payairo.com/merchants/starbucks.png",
    "identifier": "Starbucks #1234"
  },
  
  "crypto_details": null,
  "bank_details": null,
  
  "merchant_details": {
    "merchant_id": "merch_starbucks_1234",
    "merchant_name": "Starbucks",
    "merchant_logo": "https://cdn.payairo.com/merchants/starbucks.png",
    "order_id": null,
    "invoice_number": null,
    "description": "Coffee and pastry"
  },
  
  "card_details": {
    "card_id": "card_001",
    "card_last_four": "4242",
    "card_brand": "visa",
    "card_type": "debit",
    "authorization_code": "AUTH123456"
  },
  
  "note": null,
  "category": "merchant",
  "tags": ["food"],
  "refund_details": null
}
```

---

### 5️⃣ Merchant Refund

**Scenario:** User receives a refund from a merchant

```json
{
  "transaction_id": "refund-001",
  "transaction_type": "fiat_merchant_refund",
  "transaction_category": "fiat",
  "status": "success",
  "amount": "45.99",
  "final_amount": "45.99",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2025-11-26T11:00:00.000000Z",
  "updated_at": "2025-11-26T11:00:05.000000Z",
  
  "fee": {
    "amount": "0.00",
    "percentage": "0",
    "currency": "USD"
  },
  
  "sender": null,
  
  "recipient": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "incoming",
  "display_party": {
    "username": "Starbucks",
    "profile_photo": "https://cdn.payairo.com/merchants/starbucks.png",
    "identifier": "Starbucks (Refund)"
  },
  
  "crypto_details": null,
  "bank_details": null,
  
  "merchant_details": {
    "merchant_id": "merch_starbucks_1234",
    "merchant_name": "Starbucks",
    "merchant_logo": "https://cdn.payairo.com/merchants/starbucks.png",
    "order_id": "ORD-789",
    "invoice_number": null,
    "description": "Refund for incorrect order"
  },
  
  "card_details": null,
  
  "note": null,
  "category": "merchant",
  "tags": ["refund"],
  
  "refund_details": {
    "original_transaction_id": "card-tx-001",
    "refund_reason": "Incorrect order",
    "refunded_at": "2025-11-26T11:00:00.000000Z"
  }
}
```

---

### 6️⃣ Crypto Buy

**Scenario:** User buys cryptocurrency with fiat

```json
{
  "transaction_id": "crypto-buy-001",
  "transaction_type": "crypto_buy",
  "transaction_category": "crypto",
  "status": "complete",
  "amount": "100.00",
  "final_amount": "0.00234567",
  "currency": "BTC",
  "currency_symbol": "₿",
  "created_at": "2025-11-27T10:00:00.000000Z",
  "updated_at": "2025-11-27T10:00:30.000000Z",
  
  "fee": {
    "amount": "2.00",
    "percentage": "2.0",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "incoming",
  "display_party": {
    "username": "Bitcoin",
    "profile_photo": "https://cdn.payairo.com/crypto/btc.svg",
    "identifier": "BTC"
  },
  
  "crypto_details": {
    "from_currency": "USD",
    "to_currency": "BTC",
    "network": "bitcoin",
    "tx_hash": null,
    "from_address": null,
    "to_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "token": "BTC",
    "icon_url": "https://cdn.payairo.com/crypto/btc.svg",
    "exchange_rate": "42735.50",
    "usd_value": "100.00"
  },
  
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": null,
  "category": null,
  "tags": [],
  "refund_details": null
}
```

---

### 7️⃣ Crypto Sell

**Scenario:** User sells cryptocurrency for fiat

```json
{
  "transaction_id": "crypto-sell-001",
  "transaction_type": "crypto_sell",
  "transaction_category": "crypto",
  "status": "complete",
  "amount": "0.01",
  "final_amount": "425.00",
  "currency": "USD",
  "currency_symbol": "$",
  "created_at": "2025-11-27T14:00:00.000000Z",
  "updated_at": "2025-11-27T14:01:00.000000Z",
  
  "fee": {
    "amount": "8.50",
    "percentage": "2.0",
    "currency": "USD"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": null,
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "incoming",
  "display_party": {
    "username": "Bitcoin",
    "profile_photo": "https://cdn.payairo.com/crypto/btc.svg",
    "identifier": "BTC → USD"
  },
  
  "crypto_details": {
    "from_currency": "BTC",
    "to_currency": "USD",
    "network": "bitcoin",
    "tx_hash": null,
    "from_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "to_address": null,
    "token": "BTC",
    "icon_url": "https://cdn.payairo.com/crypto/btc.svg",
    "exchange_rate": "42500.00",
    "usd_value": "425.00"
  },
  
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": null,
  "category": null,
  "tags": [],
  "refund_details": null
}
```

---

### 8️⃣ Crypto Send (P2P)

**Scenario:** User sends cryptocurrency to another PayAiro user

```json
{
  "transaction_id": "crypto-send-001",
  "transaction_type": "crypto_send",
  "transaction_category": "crypto",
  "status": "complete",
  "amount": "50.00",
  "final_amount": "49.50",
  "currency": "USDT",
  "currency_symbol": "₮",
  "created_at": "2025-11-27T16:00:00.000000Z",
  "updated_at": "2025-11-27T16:00:45.000000Z",
  
  "fee": {
    "amount": "0.50",
    "percentage": "1.0",
    "currency": "USDT"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "prastu25qw",
    "email": "prastu@example.com",
    "profile_photo": null,
    "wallet_address": "0xCb25fEEC40fD800911DD2c89734Bd7fd01dA3B40",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_456",
    "username": "Badboy",
    "email": "c@yopmail.com",
    "profile_photo": null,
    "wallet_address": "0xAe216faa113b968374c500e5a349DEfc3049DAAA",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "outgoing",
  "display_party": {
    "username": "Badboy",
    "profile_photo": null,
    "identifier": "Badboy"
  },
  
  "crypto_details": {
    "from_currency": "USDT_TRX",
    "to_currency": "USDT_TRX",
    "network": "TRX",
    "tx_hash": "0x123abc456def789...",
    "from_address": "0xCb25fEEC40fD800911DD2c89734Bd7fd01dA3B40",
    "to_address": "0xAe216faa113b968374c500e5a349DEfc3049DAAA",
    "token": "USDT",
    "icon_url": "https://cdn.payairo.com/crypto/usdt.svg",
    "exchange_rate": "1.00",
    "usd_value": "50.00"
  },
  
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": "For lunch",
  "category": "family_friends",
  "tags": [],
  "refund_details": null
}
```

---

### 9️⃣ Crypto Receive (P2P)

**Scenario:** User receives cryptocurrency from another PayAiro user

```json
{
  "transaction_id": "crypto-receive-001",
  "transaction_type": "crypto_receive",
  "transaction_category": "crypto",
  "status": "complete",
  "amount": "0.5",
  "final_amount": "0.5",
  "currency": "ETH",
  "currency_symbol": "Ξ",
  "created_at": "2025-11-27T18:00:00.000000Z",
  "updated_at": "2025-11-27T18:02:00.000000Z",
  
  "fee": {
    "amount": "0.00",
    "percentage": "0",
    "currency": "ETH"
  },
  
  "sender": {
    "user_id": "user_789",
    "username": "alice_crypto",
    "email": "alice@example.com",
    "profile_photo": "https://cdn.payairo.com/users/alice.jpg",
    "wallet_address": "0xAbC123...",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": "0xDef456...",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "direction": "incoming",
  "display_party": {
    "username": "alice_crypto",
    "profile_photo": "https://cdn.payairo.com/users/alice.jpg",
    "identifier": "alice_crypto"
  },
  
  "crypto_details": {
    "from_currency": "ETH",
    "to_currency": "ETH",
    "network": "ethereum",
    "tx_hash": "0x789ghi012jkl...",
    "from_address": "0xAbC123...",
    "to_address": "0xDef456...",
    "token": "ETH",
    "icon_url": "https://cdn.payairo.com/crypto/eth.svg",
    "exchange_rate": null,
    "usd_value": "1200.00"
  },
  
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": null,
  "category": null,
  "tags": [],
  "refund_details": null
}
```

---

### 🔟 Crypto Withdrawal (to External Wallet)

**Scenario:** User withdraws cryptocurrency to an external wallet

```json
{
  "transaction_id": "crypto-withdrawal-001",
  "transaction_type": "crypto_withdrawal",
  "transaction_category": "crypto",
  "status": "complete",
  "amount": "100.00",
  "final_amount": "98.00",
  "currency": "USDT",
  "currency_symbol": "₮",
  "created_at": "2025-11-28T08:00:00.000000Z",
  "updated_at": "2025-11-28T08:05:00.000000Z",
  
  "fee": {
    "amount": "2.00",
    "percentage": "2.0",
    "currency": "USDT"
  },
  
  "sender": {
    "user_id": "user_current",
    "username": "john_doe",
    "email": "john@example.com",
    "profile_photo": null,
    "wallet_address": "0xPayAiro123...",
    "bank_name": null,
    "account_number_masked": null
  },
  
  "recipient": null,
  
  "direction": "outgoing",
  "display_party": {
    "username": "External Wallet",
    "profile_photo": null,
    "identifier": "0xExternal456..."
  },
  
  "crypto_details": {
    "from_currency": "USDT_TRX",
    "to_currency": "USDT_TRX",
    "network": "TRX",
    "tx_hash": "0xWithdrawalHash...",
    "from_address": "0xPayAiro123...",
    "to_address": "0xExternal456...",
    "token": "USDT",
    "icon_url": "https://cdn.payairo.com/crypto/usdt.svg",
    "exchange_rate": "1.00",
    "usd_value": "100.00"
  },
  
  "bank_details": null,
  "merchant_details": null,
  "card_details": null,
  
  "note": "Moving to cold storage",
  "category": null,
  "tags": ["withdrawal"],
  "refund_details": null
}
```

---

## Scenario Field Name Reference

Use this section as a quick checklist when wiring each scenario. Field names follow the unified response schema and should always be present (set to `null` when data does not exist).

### 🇺🇸 Fiat Scenarios

#### 1️⃣ Fiat Send (`fiat_send`)
- **Core:** `transaction_id`, `transaction_type`, `transaction_category`, `status`, `amount`, `final_amount`, `currency`, `currency_symbol`, `created_at`, `updated_at`
- **Fee:** `fee.amount`, `fee.percentage`, `fee.currency`
- **Participants:** `sender.*`, `recipient.*` (all nested keys: `user_id`, `username`, `email`, `profile_photo`, `wallet_address`, `bank_name`, `account_number_masked`)
- **Direction/UI:** `direction`, `display_party.username`, `display_party.profile_photo`, `display_party.identifier`
- **Metadata:** `note`, `category`, `tags`
- **Refunds:** `refund_details` (usually `null`)

#### 2️⃣ Fiat Receive (`fiat_receive`)
- **Same core + fee set as send**
- **Participants:** `sender.*` (payer), `recipient.*` (current user, may include `bank_name`, `account_number_masked`)
- **Direction/UI:** `direction`, `display_party.*`
- **Metadata:** `note`, `category`, `tags`
- **Refunds:** `refund_details`

#### 3️⃣ External Bank Transfer Out (`fiat_bank_transfer_out`)
- **Core + fee fields**
- **Participants:** `sender.*` (current user), `recipient` is `null`
- **Direction/UI:** `direction`, `display_party.*`
- **Bank Specific:** `bank_details.bank_name`, `bank_details.bank_logo`, `bank_details.account_type`, `bank_details.routing_number_masked`, `bank_details.account_number_masked`, `bank_details.transfer_method`
- **Metadata:** `note`, `category`, `tags`
- **Refunds:** `refund_details`

#### 4️⃣ Debit Card Transaction (`fiat_card_purchase`)
- **Core + fee fields**
- **Participants:** `sender.*` (current user), `recipient` is `null`
- **Direction/UI:** `direction`, `display_party.*`
- **Merchant:** `merchant_details.merchant_id`, `merchant_details.merchant_name`, `merchant_details.merchant_logo`, `merchant_details.order_id`, `merchant_details.invoice_number`, `merchant_details.description`
- **Card:** `card_details.card_id`, `card_details.card_last_four`, `card_details.card_brand`, `card_details.card_type`, `card_details.authorization_code`
- **Metadata:** `note`, `category`, `tags`
- **Refunds:** `refund_details`

#### 5️⃣ Merchant Refund (`fiat_merchant_refund`)
- **Core + fee fields**
- **Participants:** `sender` is `null`, `recipient.*` (current user)
- **Direction/UI:** `direction`, `display_party.*`
- **Merchant:** same keys as card purchase
- **Refund Info:** `refund_details.original_transaction_id`, `refund_details.refund_reason`, `refund_details.refunded_at`
- **Metadata:** `note`, `category`, `tags`

### ₿ Crypto Scenarios

#### 6️⃣ Crypto Buy (`crypto_buy`)
- **Core + fee fields**
- **Participants:** `sender.*` and `recipient.*` both reference the current user
- **Direction/UI:** `direction`, `display_party.*` (token branding)
- **Crypto Details:** `crypto_details.from_currency`, `crypto_details.to_currency`, `crypto_details.network`, `crypto_details.tx_hash`, `crypto_details.from_address`, `crypto_details.to_address`, `crypto_details.token`, `crypto_details.icon_url`, `crypto_details.exchange_rate`, `crypto_details.usd_value`
- **Metadata:** `note`, `category`, `tags`

#### 7️⃣ Crypto Sell (`crypto_sell`)
- **Same core, fee, metadata fields as crypto buy**
- **Participants:** both nested objects point to the current user
- **Direction/UI:** `direction`, `display_party.*`
- **Crypto Details:** same keys as buy (representing the on-chain asset that was sold)

#### 8️⃣ Crypto Send (`crypto_send`)
- **Core + fee fields**
- **Participants:** `sender.*` (current user), `recipient.*` (counterparty user)
- **Direction/UI:** `direction`, `display_party.*`
- **Crypto Details:** full object as above, including on-chain addresses (`from_address`, `to_address`) and `tx_hash`
- **Metadata:** `note`, `category`, `tags`

#### 9️⃣ Crypto Receive (`crypto_receive`)
- **Core + fee fields**
- **Participants:** `sender.*` (counterparty), `recipient.*` (current user)
- **Direction/UI:** `direction`, `display_party.*`
- **Crypto Details:** same keys as send
- **Metadata:** `note`, `category`, `tags`

#### 🔟 Crypto Withdrawal (`crypto_withdrawal`)
- **Core + fee fields**
- **Participants:** `sender.*` (current user), `recipient` is `null`
- **Direction/UI:** `direction`, `display_party.*`
- **Crypto Details:** same keys, with `to_address` storing the external destination
- **Tags:** include `tags` to flag manual review / fee anomalies when needed
- **Metadata:** `note`, `category`
- **Refunds:** `refund_details` (usually `null`, but reserved for reversals)

---

### ♻️ Crypto Trade Payload Conversion (Legacy → Unified)

The legacy `trades` payload shared above has been normalized below using the unified transaction schema. We treat `fa0d21e3-ec41-4184-a4cd-6a0fa36e5831` as the authenticated user when deriving `direction`, `sender`, and `recipient`. The sample covers the five crypto scenarios (send, receive, buy, sell, withdrawal) plus the high-fee withdrawal edge case (trade `247`).

```json
{
  "crypto_trades_unified_examples": [
    {
      "transaction_id": "ef2afe93ac1156fdfce62293a409864a",
      "transaction_type": "crypto_send",
      "transaction_category": "crypto",
      "status": "complete",
      "amount": "0.10",
      "final_amount": "0.10",
      "currency": "USDT",
      "currency_symbol": "₮",
      "created_at": "2025-10-28T14:23:26.687946+05:30",
      "updated_at": "2025-10-28T14:23:26.687946+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "0",
        "currency": "USDT"
      },
      "sender": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": "basnetdhiraz@gmail.com",
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": {
        "user_id": "da170429-6c59-4e4e-a709-b2b201dfa0d7",
        "username": "ssubed1287",
        "email": "cuzhira7@gmail.com",
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "direction": "outgoing",
      "display_party": {
        "username": "ssubed1287",
        "profile_photo": null,
        "identifier": "cuzhira7@gmail.com"
      },
      "crypto_details": {
        "from_currency": "USDT_TRX",
        "to_currency": "USDT_TRX",
        "network": null,
        "tx_hash": null,
        "from_address": null,
        "to_address": null,
        "token": "USDT",
        "icon_url": "https://app.payairo.com/media/profile_photos/USDT-TRC20.png",
        "exchange_rate": null,
        "usd_value": "0.00"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "p2p",
      "tags": [],
      "refund_details": null
    },
    {
      "transaction_id": "SOL_5esgUYzQJYFxcz74_8e4ddf63",
      "transaction_type": "crypto_receive",
      "transaction_category": "crypto",
      "status": "success",
      "amount": "0.10",
      "final_amount": "0.10",
      "currency": "USDC",
      "currency_symbol": "$",
      "created_at": "2025-11-27T01:01:26.230869+05:30",
      "updated_at": "2025-11-27T01:01:26.230869+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "0",
        "currency": "USDC"
      },
      "sender": {
        "user_id": "d004ed61-f6d2-492e-a641-6a73f5318bdd",
        "username": null,
        "email": "krish@gmail.com",
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": "mailmemanojsingh8800@gmail.com",
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "direction": "incoming",
      "display_party": {
        "username": "krish@gmail.com",
        "profile_photo": null,
        "identifier": "krish@gmail.com"
      },
      "crypto_details": {
        "from_currency": "USDC",
        "to_currency": "USDC",
        "network": "Solana",
        "tx_hash": null,
        "from_address": null,
        "to_address": "67iXBmvzo39QDi8SxeWFbk1MEjYo7TEimQTiQJxtmiFM",
        "token": "USDC",
        "icon_url": "https://app.payairo.com/media/profile_photos/crypto.png",
        "exchange_rate": "1.00",
        "usd_value": "0.10"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "p2p",
      "tags": [],
      "refund_details": null
    },
    {
      "transaction_id": "894fcb811f43b816e3c2f7beb3397473",
      "transaction_type": "crypto_buy",
      "transaction_category": "crypto",
      "status": "complete",
      "amount": "5.39",
      "final_amount": "0.00005",
      "currency": "USD",
      "currency_symbol": "$",
      "created_at": "2025-10-17T02:23:05.293512+05:30",
      "updated_at": "2025-10-17T02:23:05.293512+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "0",
        "currency": "USD"
      },
      "sender": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "direction": "incoming",
      "display_party": {
        "username": "Bitcoin",
        "profile_photo": "https://app.payairo.com/media/extracted/1/Crypto%20Tokens/BTC.svg",
        "identifier": "BTC"
      },
      "crypto_details": {
        "from_currency": "USD",
        "to_currency": "BTC",
        "network": null,
        "tx_hash": null,
        "from_address": null,
        "to_address": null,
        "token": "BTC",
        "icon_url": "https://app.payairo.com/media/extracted/1/Crypto%20Tokens/BTC.svg",
        "exchange_rate": "107800.00",
        "usd_value": "5.39"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "investment",
      "tags": [],
      "refund_details": null
    },
    {
      "transaction_id": "8aaa90a63405cf91693d528f115493f2",
      "transaction_type": "crypto_sell",
      "transaction_category": "crypto",
      "status": "complete",
      "amount": "3.03",
      "final_amount": "3.0303030303030303",
      "currency": "USDT",
      "currency_symbol": "₮",
      "created_at": "2025-10-18T20:01:27.101005+05:30",
      "updated_at": "2025-10-18T20:01:27.101005+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "0",
        "currency": "USDT"
      },
      "sender": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "direction": "incoming",
      "display_party": {
        "username": "USDT → USD",
        "profile_photo": "https://app.payairo.com/media/profile_photos/USDT-TRC20.png",
        "identifier": "Exchange Desk"
      },
      "crypto_details": {
        "from_currency": "USDT_TRX",
        "to_currency": "USD",
        "network": null,
        "tx_hash": null,
        "from_address": null,
        "to_address": null,
        "token": "USDT",
        "icon_url": "https://app.payairo.com/media/profile_photos/USDT-TRC20.png",
        "exchange_rate": "1.00",
        "usd_value": "3.00"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "investment",
      "tags": [],
      "refund_details": null
    },
    {
      "transaction_id": "52d6c4b1-1ec8-4b68-b5d1-9fc2ec613ab6",
      "transaction_type": "crypto_withdrawal",
      "transaction_category": "crypto",
      "status": "complete",
      "amount": "0.10",
      "final_amount": "0.10",
      "currency": "USDC",
      "currency_symbol": "$",
      "created_at": "2025-11-25T20:14:16.214532+05:30",
      "updated_at": "2025-11-25T20:14:16.214532+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "0",
        "currency": "USDC"
      },
      "sender": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": "acey97",
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": null,
      "direction": "outgoing",
      "display_party": {
        "username": "External Wallet",
        "profile_photo": null,
        "identifier": "9LwHxD8ZWDEB3gwfFhN2amAPxyoCEGnu96zt7EYUAdhu"
      },
      "crypto_details": {
        "from_currency": "USDC_SOL",
        "to_currency": "USDC_SOL",
        "network": "shifolia",
        "tx_hash": null,
        "from_address": null,
        "to_address": "9LwHxD8ZWDEB3gwfFhN2amAPxyoCEGnu96zt7EYUAdhu",
        "token": "USDC",
        "icon_url": "https://app.payairo.com/media/profile_photos/crypto.png",
        "exchange_rate": "1.00",
        "usd_value": "0.10"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "self_transfer",
      "tags": [],
      "refund_details": null
    },
    {
      "transaction_id": "427f24fc-b451-4d82-8bab-971977074438",
      "transaction_type": "crypto_withdrawal",
      "transaction_category": "crypto",
      "status": "pending",
      "amount": "0.00",
      "final_amount": null,
      "currency": "ETH",
      "currency_symbol": "Ξ",
      "created_at": "2025-10-17T18:00:13.525566+05:30",
      "updated_at": "2025-10-17T18:00:13.525566+05:30",
      "fee": {
        "amount": "0.00",
        "percentage": "68862946677000",
        "currency": "ETH"
      },
      "sender": {
        "user_id": "fa0d21e3-ec41-4184-a4cd-6a0fa36e5831",
        "username": null,
        "email": null,
        "profile_photo": null,
        "wallet_address": null,
        "bank_name": null,
        "account_number_masked": null
      },
      "recipient": null,
      "direction": "outgoing",
      "display_party": {
        "username": "External Wallet",
        "profile_photo": null,
        "identifier": "0x505662c0E1deb60a4F9902d81af93F87affA39B7"
      },
      "crypto_details": {
        "from_currency": "ETH",
        "to_currency": "ETH",
        "network": "mainnet",
        "tx_hash": null,
        "from_address": null,
        "to_address": "0x505662c0E1deb60a4F9902d81af93F87affA39B7",
        "token": "ETH",
        "icon_url": "https://app.payairo.com/media/extracted/1/Crypto%20Tokens/ETH.svg",
        "exchange_rate": null,
        "usd_value": "1.12"
      },
      "bank_details": null,
      "merchant_details": null,
      "card_details": null,
      "note": null,
      "category": "self_transfer",
      "tags": [
        "awaiting_network_fee_quote",
        "manual_review_required"
      ],
      "refund_details": null
    }
  ]
}
```

---

## Migration Mapping (Old → New)

Use this table to map existing API fields to the new unified structure:

| Old Field | New Field Path |
|-----------|---------------|
| `id` (numeric) | `transaction_id` (keep UUID) |
| `id` (UUID string) | `transaction_id` |
| `timestamp` | `created_at` |
| `created_at` | `created_at` |
| `sender` (email) | `sender.email` |
| `sender_username` | `sender.username` |
| `sender_profile_photo` | `sender.profile_photo` |
| `sender_wallet_public_key` | `sender.wallet_address` |
| `recipient` (email) | `recipient.email` |
| `recipient_username` | `recipient.username` |
| `recipient_profile_photo` | `recipient.profile_photo` |
| `recipient_wallet_public_key` | `recipient.wallet_address` |
| `Transaction_fee_persentage` | `fee.percentage` |
| `type` (buy/sell/send) | `transaction_type` |
| `token` | `crypto_details.token` |
| `network` | `crypto_details.network` |
| `tx_hash` | `crypto_details.tx_hash` |
| `from_currency` | `crypto_details.from_currency` |
| `to_currency` | `crypto_details.to_currency` |
| `usd_amount` / `usd_value` | `crypto_details.usd_value` |
| `trade_id` | `transaction_id` |
| `order_id` | `merchant_details.order_id` |
| `description` | `merchant_details.description` |

---

## API Rules for Backend

### ✅ MUST DO

1. **Consistency**: Both dashboard list API and transaction detail API **MUST** return identical structure
2. **Null vs Undefined**: Always return `null`, never omit fields or return `undefined`
3. **No "null" strings**: Return actual `null`, not the string `"null"`
4. **Timestamps**: Always use ISO 8601 format with timezone (`Z` for UTC)
5. **Amounts as Strings**: Always return amounts as strings to preserve decimal precision
6. **Direction**: Backend **MUST** compute `direction` based on current authenticated user
7. **Display Party**: Backend **MUST** compute `display_party` to simplify frontend logic

### ❌ MUST NOT DO

1. Return different structures from different endpoints for the same transaction
2. Return amounts as numbers (use strings to preserve precision)
3. Return `"null"` as a string instead of actual `null`
4. Omit fields that should be `null`
5. Use inconsistent naming (mixing camelCase and snake_case)
6. Return timestamps in non-ISO 8601 formats

### 📝 Notes for Implementation

1. **User Context**: The `direction` and `display_party` fields require knowing the current authenticated user
2. **Category Objects**: Set entire category objects (like `crypto_details`, `bank_details`) to `null` when not applicable
3. **Empty Arrays**: Return empty arrays `[]` for `tags` when no tags exist
4. **Fee Calculation**: Always include `fee` object even if amount is `"0.00"`

---

## Benefits of This Structure

| Benefit | Description |
|---------|-------------|
| ✅ **Eliminates frontend data transformation** | Frontend can directly use API response |
| ✅ **Works consistently across all transaction types** | One structure, all scenarios |
| ✅ **Extensible for future types** | Easy to add IRA, RWA transactions |
| ✅ **Matches UI requirements exactly** | All needed display fields included |
| ✅ **Supports both list and detail views** | Same structure everywhere |
| ✅ **Backward compatible migration path** | Clear mapping from old to new |

---

## Questions?

Contact the Frontend Team for clarification on any field requirements or edge cases.

