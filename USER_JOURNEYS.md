# PayAiro App - User Journeys & Flow Diagrams
## Visual Guide for UX Design & Development

---

## 🎯 PURPOSE

This document provides detailed user journeys and flow diagrams for all major features in the PayAiro app. Use this as a reference for:
- UX design and wireframing
- User story creation
- Development implementation
- QA test case creation

---

## 📱 1. NEW USER ONBOARDING JOURNEY

### Journey Overview
**Goal**: Complete registration and KYC to start using the app  
**Duration**: 10-15 minutes  
**Success Rate Target**: 90%+ completion

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: APP LAUNCH & LANDING                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Landing Page]
                    • App logo
                    • Value proposition
                    • "Get Started" button
                    • "Already have account?" link
                              ↓
                    User clicks "Get Started"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: PHONE NUMBER ENTRY                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Signup Screen]
                    • Country code selector
                    • Phone number input
                    • Terms checkbox
                    • "Continue" button
                              ↓
                    System sends OTP via SMS
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: OTP VERIFICATION                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [OTP Screen]
                    • 6-digit OTP input
                    • Resend OTP (60s timer)
                    • Auto-detect OTP from SMS
                    • "Verify" button
                              ↓
                    Verification successful
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: OPTIONAL INVITE CODE                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Invite Code Screen]
                    • Invite code input (optional)
                    • "Skip" button
                    • "Continue" button
                              ↓
              User enters code or skips
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: PERSONAL INFORMATION - NAME                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Name Entry Screen]
                    • First name input
                    • Middle name input (optional)
                    • Last name input
                    • "Continue" button
                              ↓
                    Validation & proceed
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: DATE OF BIRTH                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [DOB Screen]
                    • Date picker
                    • Age validation (18+)
                    • "Continue" button
                              ↓
                    Validation & proceed
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: ADDRESS INFORMATION                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Address Screen]
                    • Street address 1
                    • Street address 2 (optional)
                    • City
                    • State selector modal
                    • ZIP code
                    • "Continue" button
                              ↓
                    Address validated
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: ID PROOF UPLOAD                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [ID Proof Screen]
                    • Document type selector
                      (Passport, Driver's License, ID Card)
                    • "Take Photo" button
                    • "Choose from Gallery" button
                    • Preview image
                    • "Continue" button
                              ↓
              User captures/selects ID
                              ↓
                    Image uploaded to server
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: SELFIE CAPTURE                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Selfie Screen]
                    • Live camera view
                    • Face detection guide
                    • "Capture" button
                    • Retake option
                    • "Continue" button
                              ↓
              Selfie captured & uploaded
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: DIGITAL SIGNATURE                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Signature Screen]
                    • Signature canvas
                    • "Clear" button
                    • "Continue" button
                              ↓
                    Signature saved
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 11: PAYTAG CREATION                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [PayTag Screen]
                    • Unique username input
                    • Availability check (real-time)
                    • Suggestions if taken
                    • "Continue" button
                              ↓
              Username available & saved
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 12: LEGAL AGREEMENTS                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Legal Screen]
                    • Terms & Conditions (scrollable)
                    • Privacy Policy link
                    • Checkboxes for agreements
                    • "Accept & Continue" button
                              ↓
                    User accepts terms
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 13: PIN CREATION                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [PIN Setup Screen]
                    • 4-6 digit PIN input
                    • Strength indicator
                    • "Continue" button
                              ↓
                    [Confirm PIN Screen]
                    • Re-enter PIN
                    • "Confirm" button
                              ↓
              PIN matches & saved
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 14: BIOMETRIC SETUP (OPTIONAL)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Biometric Screen]
                    • Explanation of biometric security
                    • "Enable Biometric" button
                    • "Skip" option
                              ↓
            User enables or skips biometric
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 15: SUCCESS & ONBOARDING COMPLETE                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Success Screen]
                    • Success animation
                    • Welcome message
                    • "Get Started" button
                              ↓
              User clicks "Get Started"
                              ↓
            ┌─────────────────────────┐
            │   MAIN DASHBOARD        │
            │   (User is now logged in)│
            └─────────────────────────┘
```

### Exit Points & Error Handling

**Back Button Handling:**
- Allow back navigation to previous steps
- Save progress automatically
- Resume from last completed step

**Error Scenarios:**
- Invalid OTP → Show error, allow resend
- ID verification failed → Show reason, allow retry
- Network error → Show retry button
- Duplicate PayTag → Show suggestions

---

## 💸 2. SEND MONEY JOURNEY

### Journey Overview
**Goal**: Successfully send money to another user  
**Duration**: 30-60 seconds  
**Success Rate Target**: 95%+

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STARTING POINT: Dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks "Send" button
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: RECIPIENT SELECTION                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Send Screen]
                    • Recent contacts (quick access)
                    • "Select from Contacts" button
                    • Manual entry options:
                      - Email
                      - Username/PayTag
                      - Wallet address
                    • "Scan QR Code" button
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
    [OPTION A: Contact]          [OPTION B: Manual Entry]
            │                                 │
    • Select from list           • Enter email/username/address
    • Search contacts            • Validate recipient
            │                                 │
            └───────────────┬────────────────┘
                              ↓
                    Recipient selected & validated
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: AMOUNT INPUT                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Amount Screen]
                    • Recipient info displayed (name/avatar)
                    • Large amount input field
                    • Currency selector (USD/Crypto)
                    • Available balance shown
                    • "Add Note" (optional)
                    • "Continue" button
                              ↓
                    User enters amount & note
                              ↓
                    Validation:
                    ✓ Amount > $0
                    ✓ Amount ≤ Available balance
                    ✓ Amount ≤ Transaction limit
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: SELECT SOURCE ACCOUNT                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Select Account Modal]
                    • List of available accounts:
                      - Fiat Wallet
                      - Crypto Wallet
                      - Linked bank accounts
                    • Each showing current balance
                    • "Select" button
                              ↓
                    Account selected
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: TRANSACTION REVIEW                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Review Screen]
                    • Recipient details
                    • Amount to send
                    • Transaction fee
                    • Total amount
                    • Source account
                    • Note/memo
                    • "Confirm & Send" button
                    • "Edit" option
                              ↓
            User reviews & clicks "Confirm"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: SECURITY VERIFICATION                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────┴──────────────────┐
        │                                     │
[If Biometric Enabled]          [If Biometric Disabled]
        │                                     │
    [Biometric Prompt]                  [PIN Entry]
    • Fingerprint/Face ID               • 4-6 digit PIN
    • "Authenticate" message            • "Verify" button
        │                                     │
        └─────────────────┬──────────────────┘
                              ↓
                    Authentication successful
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: TRANSACTION PROCESSING                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Processing Screen]
                    • Loading animation
                    • "Processing your transaction..."
                    • Cannot go back during processing
                              ↓
                    API call to backend
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
        [SUCCESS]                        [FAILURE]
            │                                 │
┌─────────────────────────┐    ┌──────────────────────────┐
│ Transaction Complete     │    │ Transaction Failed       │
└─────────────────────────┘    └──────────────────────────┘
            │                                 │
            ↓                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: RESULT SCREEN                                          │
└─────────────────────────────────────────────────────────────────┘
            │                                 │
    [Success Screen]                  [Error Screen]
    • Success animation              • Error icon
    • "Transaction Successful"       • Error message
    • Transaction details            • "Try Again" button
    • "View Receipt" button          • "Contact Support" link
    • "Send Again" button            │
    • "Back to Home" button          │
            │                                 │
            ↓                                 ↓
        ┌───────────────────────────────┐
        │ Transaction Details Modal      │
        │ (if user clicks "View Receipt")│
        └───────────────────────────────┘
                    • Transaction ID
                    • Date & Time
                    • Amount
                    • Fee
                    • Recipient
                    • Status
                    • "Share Receipt" button
                    • "Download PDF" button
                              ↓
            ┌────────────────────────────┐
            │   BACK TO DASHBOARD        │
            └────────────────────────────┘
```

### Alternative Entry Points

```
Dashboard → Send Button → Flow starts at Step 1

Dashboard → Contacts → Select Contact → "Send Money" → Flow starts at Step 2

Dashboard → QR Scanner → Scan QR → Flow starts at Step 2 (recipient pre-filled)

Notification → Payment Request → "Pay Now" → Flow starts at Step 2 (recipient pre-filled)
```

---

## 📥 3. RECEIVE MONEY JOURNEY

### Journey Overview
**Goal**: Generate QR/address to receive payment  
**Duration**: 15-30 seconds  
**Success Rate Target**: 98%+

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STARTING POINT: Dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                User clicks "Receive" button
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ RECEIVE OPTIONS SCREEN                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
    [OPTION A: Generate QR]      [OPTION B: Request Payment]
            │                                 │
            ↓                                 ↓
┌──────────────────────┐         ┌────────────────────────┐
│ QR CODE GENERATION   │         │ PAYMENT REQUEST        │
└──────────────────────┘         └────────────────────────┘
            │                                 │
            ↓                                 ↓
    [Receive Screen]               [Request Money Screen]
    • User's QR code              • Select recipient
    • Wallet address              • Enter amount
    • "Copy Address" button       • Add note
    • "Share" button              • "Request" button
    • Amount input (optional)     │
    │                              │
    ↓                              ↓
    [If amount entered]            Request sent to recipient
    • QR updates with amount      │
    • Amount shown on screen      ↓
    │                              [Waiting Screen]
    ↓                              • Pending request shown
    User shares QR or address     • "Cancel Request" option
    │                              │
    ↓                              ↓
    [Waiting for payment]          [Notification when paid]
    • Listen for transaction      • Push notification
    • Real-time balance update    • In-app notification
    │                              │
    ↓                              ↓
    [Payment Received]             [Payment Received]
    • Success notification        • Transaction details
    • "View Transaction" button   • "View Transaction" button
    │                              │
    └──────────────┬───────────────┘
                   ↓
        ┌──────────────────────┐
        │ TRANSACTION DETAILS  │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │ BACK TO DASHBOARD    │
        └──────────────────────┘
```

---

## ₿ 4. BUY CRYPTOCURRENCY JOURNEY

### Journey Overview
**Goal**: Purchase cryptocurrency with fiat currency  
**Duration**: 1-2 minutes  
**Success Rate Target**: 90%+

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STARTING POINT: Dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    User navigates to Crypto Section
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CRYPTO DASHBOARD                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Crypto List Screen]
                • List of available cryptocurrencies
                • Current prices
                • 24h change indicators
                • Search functionality
                • Favorite/Popular tabs
                              ↓
            User selects cryptocurrency
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: CRYPTO DETAILS                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Crypto Details Screen]
                • Coin name & symbol
                • Current price
                • Price chart (1D, 1W, 1M, 3M, 1Y, ALL)
                • 24h high/low
                • Market cap
                • Description
                • "Buy" button
                • "Sell" button (if user owns)
                              ↓
                User clicks "Buy" button
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: BUY AMOUNT INPUT                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Buy Crypto Screen]
                • Selected crypto logo & name
                • Current price
                • Currency toggle (USD ⇄ Crypto)
                  ┌────────────────────────────┐
                  │ [USD Input Mode]           │
                  │ • Enter USD amount         │
                  │ • Shows crypto equivalent  │
                  │                            │
                  │ OR                         │
                  │                            │
                  │ [Crypto Input Mode]        │
                  │ • Enter crypto amount      │
                  │ • Shows USD equivalent     │
                  └────────────────────────────┘
                • Available balance shown
                • Quick amount buttons ($50, $100, $500, Max)
                • Fee breakdown
                • Total cost
                • "Continue" button
                              ↓
            User enters amount & continues
                              ↓
                Validation:
                ✓ Amount > Minimum ($10)
                ✓ Amount ≤ Available balance
                ✓ Amount ≤ Transaction limit
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: SELECT PAYMENT SOURCE                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Payment Source Modal]
                • Fiat wallet (if sufficient balance)
                • Linked bank accounts
                • Debit/Credit cards
                • Each showing balance/status
                • "Add Payment Method" option
                              ↓
            User selects payment source
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: REVIEW PURCHASE                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Review Purchase Screen]
                ┌──────────────────────────────┐
                │ PURCHASE SUMMARY             │
                ├──────────────────────────────┤
                │ Cryptocurrency: BTC          │
                │ Amount: 0.0025 BTC          │
                │ Price: $40,000 per BTC      │
                │                              │
                │ Subtotal: $100.00           │
                │ Network Fee: $2.50          │
                │ Service Fee: $1.50          │
                │ ────────────────────────     │
                │ Total: $104.00              │
                │                              │
                │ Payment: Fiat Wallet         │
                │                              │
                │ [Edit] [Confirm Purchase]    │
                └──────────────────────────────┘
                              ↓
            User clicks "Confirm Purchase"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: AUTHENTICATION                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            [PIN or Biometric Verification]
                              ↓
                Authentication successful
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: PROCESSING                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Processing Screen]
                • Loading animation
                • "Processing your purchase..."
                • "This may take a few moments"
                              ↓
                API calls:
                1. Deduct from payment source
                2. Create trade on Cybrid/Fortress
                3. Credit crypto to wallet
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
        [SUCCESS]                        [FAILURE]
            │                                 │
            ↓                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: RESULT                                                  │
└─────────────────────────────────────────────────────────────────┘
            │                                 │
    [Success Screen]                  [Error Screen]
    ┌────────────────────┐            ┌──────────────────────┐
    │ ✅ Purchase Complete│            │ ❌ Purchase Failed    │
    │                    │            │                      │
    │ You now own:       │            │ Reason:              │
    │ 0.0025 BTC        │            │ [Error message]      │
    │                    │            │                      │
    │ • View Transaction │            │ [Try Again]          │
    │ • Buy More         │            │ [Contact Support]    │
    │ • Back to Crypto   │            │                      │
    │ • Back to Home     │            │                      │
    └────────────────────┘            └──────────────────────┘
            │                                 │
            └───────────────┬─────────────────┘
                            ↓
                ┌───────────────────────┐
                │ Crypto Dashboard      │
                │ (Updated balance)     │
                └───────────────────────┘
```

### KYC Level Check

```
Before Buy Flow:
    ↓
[Check KYC Level]
    │
    ├─ Level 0: Show KYC prompt → Redirect to KYC flow
    │
    ├─ Level 1: Allow small purchases (< $500)
    │
    └─ Level 2: Allow all purchases
```

---

## 🏦 5. ADD BALANCE (LINK BANK) JOURNEY

### Journey Overview
**Goal**: Link external bank account and add funds  
**Duration**: 2-3 minutes  
**Success Rate Target**: 85%+

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STARTING POINT: Dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            User clicks "Add Balance" button
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: SELECT FUNDING METHOD                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Add Balance Screen]
                ┌────────────────────────────┐
                │ FUNDING METHODS            │
                ├────────────────────────────┤
                │ ○ ACH Transfer             │
                │   (3-5 business days)      │
                │                            │
                │ ○ Debit Card               │
                │   (Instant, 2.5% fee)      │
                │                            │
                │ ○ Credit Card              │
                │   (Instant, 3.5% fee)      │
                │                            │
                │ ○ Bank Transfer (Plaid)    │
                │   (1-2 business days)      │
                └────────────────────────────┘
                              ↓
        User selects "Bank Transfer (Plaid)"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: BANK SELECTION                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
    [Has Linked Banks]             [No Linked Banks]
            │                                 │
            ↓                                 ↓
    [Bank Selection Modal]         [Link Bank Screen]
    • List of linked banks         • "Link New Bank" button
    • Each with balance            • Plaid explanation
    • "Use This Bank" button       │
    • "Link New Bank" option       │
            │                       │
            │◄──────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: PLAID INTEGRATION                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Plaid Link Screen]
                • Fetching link token...
                • Loading indicator
                              ↓
                Link token received
                              ↓
                [Plaid SDK Opens]
                ┌────────────────────────────┐
                │ 1. Search/Select Bank      │
                │    • Search bar            │
                │    • Popular banks         │
                │    • All banks list        │
                │         ↓                  │
                │ 2. Enter Credentials       │
                │    • Username              │
                │    • Password              │
                │         ↓                  │
                │ 3. MFA (if required)       │
                │    • SMS/Email code        │
                │         ↓                  │
                │ 4. Select Account(s)       │
                │    • Checking              │
                │    • Savings               │
                │    • Multiple selection    │
                │         ↓                  │
                │ 5. Review Permissions      │
                │    • Read-only access      │
                │    • Account info          │
                │    • Balance               │
                │    • Transactions          │
                └────────────────────────────┘
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
        [SUCCESS]                        [CANCELLED]
            │                                 │
            ↓                                 ↓
    [Public token received]          [Cancellation Screen]
            │                         • "Try Again" button
            ↓                         • "Back" button
    Exchange public token                    │
    for access token                         │
            │                                 │
            ↓                                 │
    Save to backend                          │
            │                                 │
            ↓                                 │
    Fetch account balance                    │
            │                                 │
            ↓                                 │
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: ENTER DEPOSIT AMOUNT                                   │
└─────────────────────────────────────────────────────────────────┘
            │                                 │
            │◄────────────────────────────────┘
            ↓
        [Amount Input Screen]
        • Selected bank shown
        • Available balance in bank
        • Amount input
        • Quick amounts ($50, $100, $500, $1000)
        • Destination account selector
          (Fiat Wallet, Crypto Wallet, IRA)
        • Processing time estimate
        • "Continue" button
                              ↓
            User enters amount & continues
                              ↓
                Validation:
                ✓ Amount > $10
                ✓ Amount ≤ Bank balance
                ✓ Amount ≤ Daily limit
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: REVIEW DEPOSIT                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Review Screen]
                ┌──────────────────────────────┐
                │ DEPOSIT SUMMARY              │
                ├──────────────────────────────┤
                │ From: Chase Bank (...1234)   │
                │ To: Fiat Wallet             │
                │                              │
                │ Amount: $500.00             │
                │ Fee: $0.00                  │
                │ ────────────────────────     │
                │ Total: $500.00              │
                │                              │
                │ Processing: 1-2 business days│
                │                              │
                │ [Edit] [Confirm Deposit]     │
                └──────────────────────────────┘
                              ↓
            User clicks "Confirm Deposit"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: AUTHENTICATION                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            [PIN or Biometric Verification]
                              ↓
                Authentication successful
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: INITIATE TRANSFER                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Processing Screen]
                • "Initiating transfer..."
                              ↓
                ACH transfer initiated
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: CONFIRMATION                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Success Screen]
                ┌────────────────────────────┐
                │ ✅ Deposit Initiated        │
                │                            │
                │ Amount: $500.00            │
                │ Expected: Feb 3, 2025      │
                │                            │
                │ • View Transaction         │
                │ • Set Notification         │
                │ • Back to Home             │
                └────────────────────────────┘
                              ↓
                Push notification sent
                              ↓
        [Pending transaction shows in history]
                              ↓
        ┌──────────────────────────────┐
        │ User receives notification   │
        │ when funds arrive            │
        └──────────────────────────────┘
```

---

## 🎁 6. REWARDS & SCRATCH CARD JOURNEY

### Journey Overview
**Goal**: Engage users with rewards and increase retention  
**Duration**: 30-60 seconds  
**Success Rate Target**: 95%+

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ ENTRY POINTS                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
    Dashboard → Rewards Section    Notification → "New Reward"
            │                                 │
            └───────────────┬────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ REWARDS DASHBOARD                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Rewards Screen]
                ┌────────────────────────────┐
                │ MY REWARDS                 │
                ├────────────────────────────┤
                │ 🎁 Scratch Cards           │
                │    3 available             │
                │                            │
                │ 🎫 Vouchers                │
                │    5 active                │
                │                            │
                │ 👥 Referrals               │
                │    Share & earn            │
                └────────────────────────────┘
                              ↓
        User selects "Scratch Cards"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SCRATCH CARDS LIST                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                [Scratch Card Screen]
                • Available cards displayed
                • Daily card (refreshes daily)
                • Special event cards
                • Locked cards (coming soon)
                • "Scratch Now" button on each
                              ↓
        User taps on a card to scratch
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SCRATCH CARD INTERACTIVE EXPERIENCE                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            [Scratch Card Animation]
            ┌──────────────────────────────┐
            │     [Scratch Area]           │
            │                              │
            │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       │
            │  ▓▓▓▓▓     ▓▓▓▓▓▓▓▓▓▓       │
            │  ▓▓▓▓  [?] ▓▓▓▓▓▓▓▓▓▓       │
            │  ▓▓▓▓▓     ▓▓▓▓▓▓▓▓▓▓       │
            │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       │
            │                              │
            │  Scratch to reveal prize!    │
            └──────────────────────────────┘
                              ↓
            User scratches (swipe gesture)
                              ↓
            Scratch layer gradually removes
                              ↓
            Prize revealed underneath
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRIZE REVEAL                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌───────────────┴────────────────┐
            │                                 │
        [WON PRIZE]                      [NO PRIZE]
            │                                 │
            ↓                                 ↓
    [Prize Reveal Animation]         [Better Luck Animation]
    🎉 Confetti effect              😊 Encouraging message
    │                                 │
    ↓                                 ↓
    ┌──────────────────────┐         ┌──────────────────────┐
    │ 🎊 CONGRATULATIONS!  │         │ 😊 BETTER LUCK       │
    │                      │         │    NEXT TIME!        │
    │ You won:             │         │                      │
    │                      │         │ Come back tomorrow   │
    │ 💰 $5.00 Cashback   │         │ for a new card!      │
    │                      │         │                      │
    │ Added to wallet      │         │ [View Other Cards]   │
    │                      │         │ [Back to Rewards]    │
    │ [Claim Now]          │         └──────────────────────┘
    │ [View Details]       │                  │
    └──────────────────────┘                  │
            │                                  │
            ↓                                  │
┌─────────────────────────────────────────────────────────────────┐
│ CLAIM PRIZE                                                     │
└─────────────────────────────────────────────────────────────────┘
            │                                  │
            ↓                                  │
    [Prize Details Screen]                     │
    • Prize type & amount                      │
    • Terms & conditions                       │
    • Expiry date                              │
    • "Claim" button                           │
            │                                  │
            ↓                                  │
    User clicks "Claim"                        │
            │                                  │
            ↓                                  │
    [Processing]                               │
    • Crediting to account...                  │
            │                                  │
            ↓                                  │
    [Success]                                  │
    • Prize credited                           │
    • Balance updated                          │
    • "View Transaction" button                │
            │                                  │
            └──────────────┬───────────────────┘
                           ↓
                ┌──────────────────────┐
                │ REWARDS DASHBOARD    │
                │ (Updated)            │
                └──────────────────────┘
```

---

## ⚙️ 7. SETTINGS & SECURITY JOURNEY

### Common Settings Flows

### 7A. Change PIN Flow

```
Settings → Security → Change PIN
                ↓
        [Enter Current PIN]
        • 4-6 digit input
        • "Continue" button
                ↓
        Verification
                ↓
        [Enter New PIN]
        • Strength indicator
        • "Continue" button
                ↓
        [Confirm New PIN]
        • Re-enter new PIN
        • "Confirm" button
                ↓
        Match validation
                ↓
        [Success]
        • "PIN changed successfully"
        • "Done" button
                ↓
        Back to Security Settings
```

### 7B. Enable Biometric Flow

```
Settings → Security → Biometric Login
                ↓
        [Current Status: OFF]
        • Toggle switch
        • Explanation text
                ↓
        User toggles ON
                ↓
        [Check Device Support]
                ↓
    ┌───────────────┴────────────────┐
    │                                 │
[Supported]                    [Not Supported]
    │                                 │
    ↓                                 ↓
[Biometric Prompt]              [Error Message]
"Authenticate to enable"         "Device not supported"
    │                                 │
    ↓                                 │
Success                               │
    │                                 │
    ↓                                 │
[Confirmation]                        │
"Biometric login enabled"             │
    │                                 │
    └───────────────┬─────────────────┘
                    ↓
            Back to Settings
```

---

## 📊 8. TRANSACTION HISTORY JOURNEY

### Viewing and Filtering Transactions

```
Dashboard → "View All Transactions"
                ↓
        [Transaction History Screen]
        ┌────────────────────────────┐
        │ [Filter Icon] [Search]     │
        ├────────────────────────────┤
        │ TODAY                      │
        │ ↓ Sent to John - $50      │
        │ ↑ Received from Sarah - $30│
        │                            │
        │ YESTERDAY                  │
        │ ↓ Bought BTC - $100       │
        │                            │
        │ JAN 29                     │
        │ ↑ Cashback - $5           │
        └────────────────────────────┘
                ↓
        ┌───────────┴────────────┐
        │                        │
[Tap Transaction]        [Tap Filter]
        │                        │
        ↓                        ↓
[Transaction Details]    [Filter Modal]
• Full details          • Date range
• Receipt               • Type (sent/received)
• Share button          • Amount range
• Support               • Status
                        • Account type
                        │
                        ↓
                    Apply filters
                        │
                        ↓
                [Filtered Results]
```

---

## 🔄 9. ERROR HANDLING FLOWS

### Common Error Scenarios

```
ANY TRANSACTION FLOW
        ↓
    Processing...
        ↓
    ┌───────────┴────────────┐
    │                         │
[Network Error]         [Business Error]
    │                         │
    ↓                         ↓
[Error Screen]          [Error Screen]
"Connection lost"       "Insufficient balance"
"Check internet"        "Add funds to continue"
│                         │
[Retry Button]          [Add Balance Button]
[Cancel]                [Cancel]
    │                         │
    └───────────┬─────────────┘
                ↓
        User's Choice:
        • Retry
        • Add Balance
        • Cancel
```

---

## 📝 10. SUMMARY OF KEY TOUCHPOINTS

### Critical User Journeys Priority:
1. ⭐⭐⭐ **New User Onboarding** - Most important for user acquisition
2. ⭐⭐⭐ **Send Money** - Core functionality, high frequency
3. ⭐⭐⭐ **Add Balance** - Required for app usage
4. ⭐⭐ **Buy Crypto** - Revenue generating
5. ⭐⭐ **Receive Money** - Core functionality
6. ⭐ **Rewards** - Engagement feature

### Average Journey Times:
- **Onboarding**: 10-15 minutes (one-time)
- **Send Money**: 30-60 seconds
- **Receive Money**: 15-30 seconds
- **Buy Crypto**: 1-2 minutes
- **Add Balance**: 2-3 minutes (first time), 1 minute (repeat)
- **Scratch Card**: 30-60 seconds

### Conversion Optimization Points:
1. OTP verification (reduce friction)
2. KYC completion (simplify steps)
3. First transaction (reduce hesitation)
4. Bank linking (trust building)
5. Crypto purchase (education)

---

## 🎯 DESIGN RECOMMENDATIONS

### For Smooth User Experience:

1. **Progress Indicators**
   - Show step X of Y in multi-step flows
   - Progress bars for onboarding
   - Completion percentage

2. **Contextual Help**
   - Tooltips for complex features
   - Inline explanations
   - Help icons throughout

3. **Error Prevention**
   - Input validation in real-time
   - Clear constraints display
   - Disabled states when needed

4. **Feedback Loops**
   - Loading states for all actions
   - Success animations
   - Error messages with solutions

5. **Exit Points**
   - Save progress automatically
   - "Cancel" option on all flows
   - Confirmation for destructive actions

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2025  
**Next Review:** Quarterly or upon major feature additions

*For complete feature specifications, refer to FEATURES_LIST.md*  
*For quick reference, see FEATURES_SUMMARY.md*

