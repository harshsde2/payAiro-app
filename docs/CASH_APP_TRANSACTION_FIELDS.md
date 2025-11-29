## Cash App Transaction Slip Fields

### Outbound Payment (You Paid Someone)
- `recipientName`
- `recipientCashtag`
- `recipientAvatarUrl`
- `amount`
- `currency`
- `note`
- `status`
- `timestamp`
- `transactionId`
- `fundingSource`
- `networkFee`
- `boostApplied`
- `boostSavings`

### Inbound Payment (You Were Paid)
- `senderName`
- `senderCashtag`
- `senderAvatarUrl`
- `amount`
- `currency`
- `note`
- `status`
- `timestamp`
- `transactionId`
- `depositDestination`
- `senderBoostApplied`
- `receiptUrl`

### Pending Payment
- `counterpartyName`
- `counterpartyCashtag`
- `amount`
- `currency`
- `status`
- `initiatedAt`
- `expiresAt`
- `transactionId`
- `actionRequired`
- `fundingSource`
- `pendingFee`

### Completed Transfer To Bank (Cash Out)
- `destinationBankName`
- `destinationAccountLast4`
- `amount`
- `currency`
- `transferSpeed`
- `fee`
- `netAmount`
- `status`
- `initiatedAt`
- `completedAt`
- `transactionId`
- `referenceCode`

### Add Cash From Bank
- `sourceBankName`
- `sourceAccountLast4`
- `amount`
- `currency`
- `status`
- `timestamp`
- `transactionId`
- `transferSpeed`
- `instantFee`

### Refunded Payment
- `originalCounterparty`
- `originalCashtag`
- `originalAmount`
- `originalTransactionId`
- `refundAmount`
- `refundTransactionId`
- `status`
- `refundedAt`
- `refundDestination`

### Cash Card Purchase
- `merchantName`
- `merchantCategory`
- `merchantLocation`
- `amount`
- `currency`
- `status`
- `timestamp`
- `transactionId`
- `cardLast4`
- `boostApplied`
- `boostSavings`
- `receiptUrl`

### ATM Withdrawal
- `atmOperator`
- `location`
- `amount`
- `currency`
- `status`
- `timestamp`
- `transactionId`
- `fee`
- `reimbursement`
- `cardLast4`

### Bitcoin Trade
- `tradeType`
- `amountFiat`
- `amountBtc`
- `exchangeRate`
- `fee`
- `totalValue`
- `status`
- `timestamp`
- `transactionId`
- `walletId`

### Stock Trade
- `ticker`
- `companyName`
- `tradeType`
- `shares`
- `pricePerShare`
- `amount`
- `fee`
- `status`
- `timestamp`
- `transactionId`
- `custodianReference`

### JSON Example
```json
{
  "scenarios": [
    {
      "scenario": "outboundPayment",
      "recipientName": "Jamie Patel",
      "recipientCashtag": "$jamie",
      "recipientAvatarUrl": "https://cdn.example.com/avatars/jamie.png",
      "amount": "48.25",
      "currency": "USD",
      "note": "Brunch",
      "status": "completed",
      "timestamp": "2025-11-27T15:42:12Z",
      "transactionId": "pay_9d2f8b7c",
      "fundingSource": "Visa •• 4242",
      "networkFee": "0.00",
      "boostApplied": "Weekend Boost",
      "boostSavings": "2.50"
    },
    {
      "scenario": "pendingPayment",
      "counterpartyName": "Chris Lee",
      "counterpartyCashtag": "$chrislee",
      "amount": "120.00",
      "currency": "USD",
      "status": "pending",
      "initiatedAt": "2025-11-28T19:03:00Z",
      "expiresAt": "2025-12-03T19:03:00Z",
      "transactionId": "pay_4aa9026e",
      "actionRequired": "accept",
      "fundingSource": "Cash App Balance",
      "pendingFee": "0.00"
    },
    {
      "scenario": "cashOut",
      "destinationBankName": "Chase Bank",
      "destinationAccountLast4": "7711",
      "amount": "650.00",
      "currency": "USD",
      "transferSpeed": "instant",
      "fee": "8.13",
      "netAmount": "641.87",
      "status": "completed",
      "initiatedAt": "2025-11-25T14:10:44Z",
      "completedAt": "2025-11-25T14:11:02Z",
      "transactionId": "cashout_7da55c3d",
      "referenceCode": "CO-582193"
    }
  ]
}
```

