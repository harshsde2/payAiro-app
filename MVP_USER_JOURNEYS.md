# PayAiro MVP - User Journeys & App Flows
## Modern USA Market-Inspired User Experience

**Document Version:** 3.0  
**Target:** MVP Launch  
**Market:** USA  
**Inspired by:** Venmo, Cash App, Coinbase, Chime, PayPal, Robinhood

---

## 🎯 MVP JOURNEY OVERVIEW

This document provides detailed user journey maps for all MVP features, optimized for:
- **Explore-first**: Let users explore before committing (like Robinhood)
- **Progressive onboarding**: Minimal upfront, KYC triggered contextually
- **Speed**: Reduced steps, streamlined flows
- **Clarity**: Clear UI patterns from leading USA apps
- **Trust**: Security and transparency at every step
- **Delight**: Smooth animations and instant feedback

---

## 📱 1. NEW USER ONBOARDING JOURNEY (Explore-First Pattern)

### Journey Goal
Get user exploring the app in under 1 minute, KYC only when ready to transact

### Modern Onboarding Flow (Venmo/Cash App inspired)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: APP LAUNCH                                          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │              [PayAiro Logo]                         │     │
│ │                                                     │     │
│ │         "Send money. Trade crypto.                  │     │
│ │          All in one app."                           │     │
│ │                                                     │     │
│ │          [Get Started]  ← Primary                   │     │
│ │          [Sign In]     ← Secondary                  │     │
│ │          [Explore App] ← Guest Mode                 │     │
│ │                                                     │     │
│ │     Trusted by 100K+ users                          │     │
│ │     ⭐⭐⭐⭐⭐ 4.8 rating                            │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
            User taps "Get Started"
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: AUTHENTICATION METHOD SELECTION                     │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Continue with:                                       │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 🟢 Continue with Google                     │     │     │
│ │ │    [Google Logo] [Sign in with Google]     │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ ⚫ Continue with Apple                      │     │     │
│ │ │    [Apple Logo] [Sign in with Apple]       │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │              ────── OR ──────                       │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 📱 Phone Number                             │     │     │
│ │ │ [Country Code ▼] [___________]             │     │     │
│ │ │ [Continue]                                  │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 📧 Email                                    │     │     │
│ │ │ [Enter email address]                      │     │     │
│ │ │ [Continue]                                  │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [Continue as Guest]                         │     │     │
│ │ │ Explore without account                     │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
    ┌───────────┴───────────┴───────────┐
    │                                     │
[Social Login]       [Phone/Email]    [Guest Mode]
    │                   │                 │
    ↓                   ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Social Auth  │  │ OTP Verify   │  │ Guest Mode   │
│              │  │              │  │              │
│ • Provider   │  │ • 6-digit    │  │ • No signup  │
│ • Permissions│  │   OTP        │  │   needed     │
│ • Auto-fill  │  │ • Auto-detect│  │ • Limited    │
│              │  │              │  │   features   │
│ Pre-fills:   │  │              │  │              │
│ - Name       │  │              │  │              │
│ - Email      │  │              │  │              │
│ - Profile pic│  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
    │                   │                 │
    └───────────┬───────┴─────────────────┘
                ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: BASIC INFORMATION (Single Screen - Minimal)          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Tell us about yourself                              │     │
│ │                                                     │     │
│ │ First Name *                                        │     │
│ │ [John________]                                      │     │
│ │                                                     │     │
│ │ Last Name *                                         │     │
│ │ [Doe_________]                                      │     │
│ │                                                     │     │
│ │ Date of Birth * (For age verification)            │     │
│ │ [MM] [DD] [YYYY]                                    │     │
│ │ 📅 Date Picker                                      │     │
│ │                                                     │     │
│ │ Age verification: Must be 18+                       │     │
│ │                                                     │     │
│ │ 💡 We'll ask for verification when you're ready   │     │
│ │    to make transactions                             │     │
│ │                                                     │     │
│ │ [Continue & Explore]                                │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: TERMS & PRIVACY (Quick Accept)                      │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Terms & Privacy                                     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ ☑ I agree to Terms of Service              │     │     │
│ │ │ ☑ I agree to Privacy Policy                │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ [Read Terms] [Read Privacy]                        │     │
│ │                                                     │     │
│ │ [Continue & Explore App]                           │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ EXPLORATION MODE UNLOCKED                                │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │          🎉 Welcome to PayAiro!                     │     │
│ │                                                     │     │
│ │     You can now explore our features!              │     │
│ │                                                     │     │
│ │     ✓ Browse crypto prices (live data)            │     │
│ │     ✓ View demo dashboard                         │     │
│ │     ✓ Take feature tours                          │     │
│ │     ✓ Learn about PayAiro                         │     │
│ │                                                     │     │
│ │     When you're ready to send money or buy crypto,│     │
│ │     we'll help you complete verification (takes  │     │
│ │     just 2 minutes).                               │     │
│ │                                                     │     │
│ │     [Explore Dashboard]                            │     │
│ │     [Take Tour]                                    │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
              User lands on Dashboard (Demo Mode)
                          ↓
        ┌─────────────────────────────┐
        │   EXPLORATION MODE           │
        │   (Demo data, live prices)   │
        └─────────────────────────────┘
                          ↓
        [User explores app...]
                          ↓
    User tries to perform action (Send/Buy/etc.)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 🔒 CONTEXTUAL KYC PROMPT (Triggered when needed)           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Complete Verification                               │     │
│ │                                                     │     │
│ │ To send money, you need to verify                  │     │
│ │ your identity. This helps keep your                │     │
│ │ account secure.                                     │     │
│ │                                                     │     │
│ │ ✓ Takes ~2 minutes                                 │     │
│ │ ✓ Required by law                                  │     │
│ │ ✓ Bank-level security                              │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [Complete Verification Now]                 │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ [Maybe Later] ← Continue exploring                 │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
    User clicks "Complete Verification Now"
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: KYC DOCUMENT UPLOAD (Combined Screen)              │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Verify your identity                                │     │
│ │                                                     │     │
│ │ Step 1: Upload ID                                   │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [📷 Camera View]                            │     │     │
│ │ │                                              │     │     │
│ │ │ [Take Photo] or [Choose from Gallery]       │     │     │
│ │ │                                              │     │     │
│ │ │ Accepted: Driver's License, Passport, ID     │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ Step 2: Take Selfie                                 │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [📷 Camera View]                            │     │     │
│ │ │ Face detection overlay                      │     │     │
│ │ │                                              │     │     │
│ │ │ [Capture Photo]                             │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ [Upload & Continue]                                 │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Documents uploaded
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: ADDRESS (With Smart Search)                         │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Where do you live?                                  │     │
│ │                                                     │     │
│ │ Address *                                           │     │
│ │ [Start typing address...]                           │     │
│ │                                                     │     │
│ │ Auto-complete suggestions:                          │     │
│ │ • 123 Main St, New York, NY 10001                  │     │
│ │ • 123 Main Street, Los Angeles, CA 90001           │     │
│ │                                                     │     │
│ │ OR enter manually:                                  │     │
│ │ Street Address [___________]                        │     │
│ │ City [___________]                                  │     │
│ │ State [Select ▼]                                    │     │
│ │ ZIP Code [_____]                                    │     │
│ │                                                     │     │
│ │ [Continue]                                          │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: CREATE PIN                                           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Create your PIN                                     │     │
│ │                                                     │     │
│ │ Your PIN is used to secure your account            │     │
│ │ and authorize transactions                          │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [•] [•] [•] [•] [•] [•]                    │     │     │
│ │ │ PIN Entry (6 digits)                        │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ 💡 Use a PIN you can remember but others can't     │     │
│ │                                                     │     │
│ │ [Continue]                                          │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
                PIN entered
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: CONFIRM PIN                                          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Confirm your PIN                                    │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [•] [•] [•] [•] [•] [•]                    │     │     │
│ │ │ Re-enter PIN                                 │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ [Confirm]                                           │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
            PINs match → Saved securely
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: ENABLE BIOMETRIC (Optional but Encouraged)          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Make your account more secure                       │     │
│ │                                                     │     │
│ │ Use Face ID / Touch ID to sign in quickly          │     │
│ │ and approve transactions                            │     │
│ │                                                     │     │
│ │ Benefits:                                           │     │
│ │ ✓ Faster sign-in                                    │     │
│ │ ✓ Quick transaction approval                        │     │
│ │ ✓ Bank-level security                               │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [Enable Biometric Login]                    │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ [Skip for now]                                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
    ┌─────────────────────┴─────────────────────┐
    │                                             │
[Enable]                                    [Skip]
    │                                             │
    ↓                                             ↓
[Biometric Setup]                        [Proceed to Welcome]
    │                                             │
    └─────────────────────┬─────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: WELCOME / ONBOARDING COMPLETE                       │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │          🎉 [Success Animation]                     │     │
│ │                                                     │     │
│ │         Welcome to PayAiro!                         │     │
│ │                                                     │     │
│ │     Your account is set up and ready to use        │     │
│ │                                                     │     │
│ │     ✓ Identity verified                            │     │
│ │     ✓ Account secured                              │     │
│ │     ✓ Ready to send & receive money                │     │
│ │     ✓ Ready to trade crypto                        │     │
│ │                                                     │     │
│ │     [Get Started]                                   │     │
│ │                                                     │     │
│ │     Quick Tips:                                    │     │
│ │     • Link your bank to add money                  │     │
│ │     • Add a payment method                         │     │
│ │     • Send your first payment                      │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
              User lands on Dashboard
                          ↓
        ┌─────────────────────────────┐
        │   MAIN DASHBOARD             │
        │   Ready to use!              │
        └─────────────────────────────┘
```

### Onboarding Optimization (Explore-First Pattern)
- **Massive Time Saved**: 3 steps to explore vs 15 steps (80% reduction!)
- **No Pressure**: Users explore before committing
- **Contextual KYC**: Only triggered when user wants to transact
- **Social Login**: Pre-fills 60% of required information
- **Guest Mode**: Explore without any signup
- **Demo Mode**: See all features with sample data
- **Smart Address**: Auto-complete reduces typing
- **Progressive Disclosure**: Show only what's needed when needed

### Exit Points & Error Handling
- **Back Navigation**: Allowed at all steps (saves progress)
- **Skip Options**: Biometric is optional
- **Error Recovery**: Clear error messages with retry
- **Progress Indicator**: Shows "Step X of 9" at top

---

## 💸 2. SEND MONEY JOURNEY (MVP)

### Journey Goal
Complete a P2P payment in under 30 seconds (after KYC)

### Journey Context
- **With KYC**: Direct send flow (5 steps)
- **Without KYC**: KYC prompt appears first, then send flow

### Modern Send Flow (Venmo/Cash App inspired)

```
┌─────────────────────────────────────────────────────────────┐
│ STARTING POINT: Dashboard                                    │
│ User taps "Send" button                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
    [Check: Is user KYC verified?]
                          ↓
    ┌─────────────────────┴─────────────────────┐
    │                                             │
[KYC Verified]                         [Not KYC Verified]
    │                                             │
    │                                             ↓
    │                             ┌─────────────────────────────┐
    │                             │ KYC PROMPT APPEARS          │
    │                             │ (Contextual)                │
    │                             │                             │
    │                             │ "Complete verification to   │
    │                             │  send money"                │
    │                             │                             │
    │                             │ [Verify Now] [Maybe Later]  │
    │                             └─────────────────────────────┘
    │                                             │
    │                           [User chooses "Verify Now"]
    │                                             │
    │                           [KYC Flow - see onboarding]
    │                                             │
    │                           KYC complete
    │                                             │
    └─────────────────────┬─────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SEND MONEY SCREEN                                            │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ To:                                                  │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 🔍 Search contacts, username, email...      │     │     │
│ │ │ [Real-time search as you type]              │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ RECENT CONTACTS (Horizontal scroll)                │     │
│ │ ┌──┐ ┌──┐ ┌──┐ ┌──┐                                │     │
│ │ │👤│ │👤│ │👤│ │👤│                                │     │
│ │ │A │ │B │ │C │ │D │                                │     │
│ │ └──┘ └──┘ └──┘ └──┘                                │     │
│ │                                                     │     │
│ │ FAVORITES (If any)                                  │     │
│ │ ┌──┐ ┌──┐ ┌──┐                                     │     │
│ │ │⭐│ │⭐│ │⭐│                                     │     │
│ │ │👤│ │👤│ │👤│                                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
      User searches or selects contact
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ RECIPIENT SELECTED                                           │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ To: @JohnDoe                                        │     │
│ │     john@example.com                                │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │                                             │     │     │
│ │ │         $0.00                               │     │     │
│ │ │     [Large, prominent amount input]         │     │     │
│ │ │                                             │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ Quick Amounts:                                      │     │
│ │ [$5] [$10] [$25] [$50] [$100] [Custom]            │     │
│ │                                                     │     │
│ │ Note (optional):                                   │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ What's this for?                            │     │     │
│ │ │ [Dinner, Coffee, etc...]                    │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ Pay from:                                           │     │
│ │ ○ Fiat Wallet ($500.00 available)                 │     │
│ │ ○ Crypto Wallet (0.015 BTC)                       │     │
│ │                                                     │     │
│ │ [Send $0.00] ← Disabled until amount entered      │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
      User enters amount (e.g., $50)
                          ↓
      Amount validation:
      ✓ Amount > $0
      ✓ Amount ≤ Available balance
      ✓ Recipient is valid
                          ↓
      "Send" button becomes active
                          ↓
      User taps "Send"
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ REVIEW SCREEN (Bottom Sheet Modal)                          │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Review Payment                                      │     │
│ │ ─────────────────────────────                       │     │
│ │                                                     │     │
│ │ To:                                                 │     │
│ │ 👤 @JohnDoe                                        │     │
│ │                                                     │     │
│ │ Amount:                                             │     │
│ │ $50.00                                              │     │
│ │                                                     │     │
│ │ Note:                                               │     │
│ │ "Coffee money"                                      │     │
│ │                                                     │     │
│ │ Pay from:                                           │     │
│ │ Fiat Wallet                                         │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [Edit]              [Confirm & Send]        │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
      User taps "Confirm & Send"
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ SECURITY VERIFICATION                                        │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │     [Face ID Prompt]                                │     │
│ │     or                                              │     │
│ │     [PIN Entry]                                     │     │
│ │                                                     │     │
│ │     "Confirm payment"                               │     │
│ │                                                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
      Authentication successful
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PROCESSING (Optimistic UI)                                   │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │     ⚡ [Loading animation]                          │     │
│ │                                                     │     │
│ │     Processing your payment...                      │     │
│ │                                                     │     │
│ │     [Shows success immediately if possible]         │     │
│ │                                                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
    ┌─────────────────────┴─────────────────────┐
    │                                             │
[SUCCESS]                                    [FAILURE]
    │                                             │
    ↓                                             ↓
┌─────────────────────┐              ┌─────────────────────┐
│ ✅ Success Screen   │              │ ❌ Error Screen     │
│                     │              │                     │
│ 🎉 Payment Sent!    │              │ Payment Failed      │
│                     │              │                     │
│ To: @JohnDoe        │              │ [Error message]     │
│ Amount: $50.00      │              │                     │
│                     │              │ [Try Again]         │
│ [View Transaction]  │              │ [Contact Support]   │
│ [Send Again]        │              │                     │
│ [Done]              │              │                     │
└─────────────────────┘              └─────────────────────┘
    │                                             │
    └─────────────────────┬─────────────────────┘
                          ↓
                ┌─────────────────┐
                │  Dashboard       │
                │  (Updated)       │
                └─────────────────┘
```

### Alternative Entry Points
```
Dashboard → Contacts → Select Contact → "Send Money" → Amount screen

Dashboard → Scan QR → Scan code → Recipient pre-filled → Amount screen

Notification → Payment Request → "Pay Now" → Amount pre-filled → Confirm
```

### Modern UX Enhancements
- **Real-time search**: Results as you type
- **Recent contacts**: Quick access to frequent recipients
- **Quick amounts**: One-tap common amounts
- **Optimistic UI**: Show success immediately
- **Bottom sheet review**: Quick edit if needed
- **Smooth animations**: 60 FPS transitions

---

## 📥 3. RECEIVE MONEY JOURNEY

```
Dashboard → Tap "Receive"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ RECEIVE SCREEN                                               │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                     │     │
│ │        ┌──────────────────────────┐                │     │
│ │        │                          │                │     │
│ │        │    [Your QR Code]        │                │     │
│ │        │                          │                │     │
│ │        │    @YourUsername         │                │     │
│ │        └──────────────────────────┘                │     │
│ │                                                     │     │
│ │ Request Specific Amount:                           │     │
│ │ $ [Enter amount]                                    │     │
│ │ (QR updates with amount if entered)                │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ [Share QR Code]                             │     │     │
│ │ │ [Copy Link]                                 │     │     │
│ │ │ [Copy Wallet Address]                       │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User shares or displays QR
        ↓
    [Waiting for payment]
        ↓
    [Payment received notification]
        ↓
    [Success screen with transaction details]
```

---

## 💰 4. ADD MONEY JOURNEY (Apple Pay/Google Pay)

```
Dashboard → Tap "Add Money"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ ADD MONEY SCREEN                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ How much would you like to add?                     │     │
│ │                                                     │     │
│ │         $0.00                                       │     │
│ │     [Large amount input]                            │     │
│ │                                                     │     │
│ │ [$25] [$50] [$100] [$500] [Custom]                │     │
│ │                                                     │     │
│ │ Payment Method:                                     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 💳 Apple Pay                                │     │     │
│ │ │    Instant • No fee                        │     │     │
│ │ │    [Use Apple Pay]                         │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 💳 Google Pay                               │     │     │
│ │ │    Instant • No fee                        │     │     │
│ │ │    [Use Google Pay]                        │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 💳 Debit Card                               │     │     │
│ │ │    Instant • 2.5% fee                      │     │     │
│ │ │    [Add Card]                              │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │ 🏦 Link Bank Account                        │     │     │
│ │ │    Via Plaid • Free                        │     │     │
│ │ │    [Link Bank]                             │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User selects Apple Pay (example)
        ↓
    [Apple Pay sheet opens]
        ↓
    User authenticates (Face ID/Touch ID)
        ↓
    [Processing...]
        ↓
    [Success - Money added instantly]
        ↓
    Dashboard (balance updated)
```

---

## ₿ 5. BUY CRYPTO JOURNEY (Coinbase inspired)

```
Dashboard → Tap crypto or "Buy Crypto"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ CRYPTO DASHBOARD                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 🔍 [Search cryptocurrency...]                       │     │
│ │                                                     │     │
│ │ Popular:                                            │     │
│ │ [BTC] [ETH] [USDC] [SOL] [More...]                │     │
│ │                                                     │     │
│ │ [List of all cryptocurrencies]                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User taps Bitcoin
        ↓
┌─────────────────────────────────────────────────────────────┐
│ CRYPTO DETAIL SCREEN                                         │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 🟠 Bitcoin (BTC)                                    │     │
│ │ $49,650.00        ↗️ +5.2% (24h)                   │     │
│ │                                                     │     │
│ │ [Price Chart - Interactive]                         │     │
│ │ [1D] [1W] [1M] [3M] [1Y] [ALL]                    │     │
│ │                                                     │     │
│ │ ┌──────────┐ ┌──────────┐                         │     │
│ │ │  Buy     │ │  Sell    │                         │     │
│ │ └──────────┘ └──────────┘                         │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User taps "Buy"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ BUY CRYPTO SCREEN                                            │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Buy Bitcoin                                         │     │
│ │                                                     │     │
│ │ Price: $49,650 per BTC                             │     │
│ │                                                     │     │
│ │ Amount to buy:                                     │     │
│ │ ┌─────────────────────────────────────────────┐     │     │
│ │ │                                             │     │     │
│ │ │         $0.00                               │     │     │
│ │ │     [USD Input]                             │     │     │
│ │ │                                             │     │     │
│ │ └─────────────────────────────────────────────┘     │     │
│ │                                                     │     │
│ │ You'll get:                                         │     │
│ │ ~0.0002 BTC                                         │     │
│ │                                                     │     │
│ │ [$25] [$50] [$100] [$500] [Custom]                │     │
│ │                                                     │     │
│ │ Pay with:                                           │     │
│ │ ○ Fiat Wallet ($500.00)                           │     │
│ │ ○ Apple Pay                                       │     │
│ │ ○ Linked Bank Account                             │     │
│ │                                                     │     │
│ │ Fee: $1.50                                         │     │
│ │ Total: $101.50                                     │     │
│ │                                                     │     │
│ │ [Preview Buy]                                      │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User taps "Preview Buy"
        ↓
    [Review screen - similar to send money]
        ↓
    [Confirm with PIN/Biometric]
        ↓
    [Processing]
        ↓
    [Success - Crypto purchased]
        ↓
    Dashboard (crypto balance updated)
```

---

## 🔄 6. LINK BANK ACCOUNT (Plaid Flow)

```
Settings → Payment Methods → Link Bank Account
        ↓
┌─────────────────────────────────────────────────────────────┐
│ LINK BANK ACCOUNT (Plaid)                                    │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Connect your bank account securely                  │     │
│ │                                                     │     │
│ │ 🔍 [Search bank by name...]                        │     │
│ │                                                     │     │
│ │ Popular Banks:                                      │     │
│ │ • Chase                                             │     │
│ │ • Bank of America                                   │     │
│ │ • Wells Fargo                                       │     │
│ │ • Citi                                              │     │
│ │ • Capital One                                       │     │
│ │                                                     │     │
│ │ [See All Banks →]                                  │     │
│ │                                                     │     │
│ │ Security:                                           │     │
│ │ ✓ Bank-level encryption                            │     │
│ │ ✓ Read-only access                                 │     │
│ │ ✓ Never store your credentials                     │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓
    User selects bank (e.g., Chase)
        ↓
    [Plaid modal opens in-app]
        ↓
    [Plaid login screen]
        ↓
    User enters bank credentials
        ↓
    [MFA if required - SMS/Email]
        ↓
    [Select account(s) to link]
        ↓
    [Permissions review]
        ↓
    [Success - Bank linked]
        ↓
    [Balance fetched automatically]
        ↓
    Settings (bank now appears in list)
```

---

## 📊 7. TRANSACTION HISTORY (Venmo Feed Style)

```
Dashboard → Tap "View All" on Recent Transactions
        ↓
┌─────────────────────────────────────────────────────────────┐
│ ACTIVITY FEED                                                │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ [🔍 Search]  [Filters ▼]                           │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                     │         │
│ TODAY                                                         │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 👤 ↓ Sent to @JohnDoe                              │     │
│ │    -$50.00                                         │     │
│ │    "Coffee money"                                  │     │
│ │    2 hours ago                                      │     │
│ │    [Tap to view details →]                         │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                              │
│ YESTERDAY                                                    │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 🟠 Bought Bitcoin                                  │     │
│ │    -$100.00                                        │     │
│ │    ~0.002 BTC                                      │     │
│ │    Yesterday at 3:45 PM                            │     │
│ │    [Tap to view details →]                         │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                              │
│ [Pull to refresh]                                           │
│ [Load More]                                                 │
└─────────────────────────────────────────────────────────────┘
        ↓
    User taps transaction
        ↓
    [Bottom sheet modal with full details]
        ↓
    [Actions: Share Receipt, Download PDF, Get Help]
```

---

## 🎯 KEY OPTIMIZATIONS IN MVP FLOWS

### Speed Improvements:
- ✅ **Initial Onboarding**: 3 steps to explore (down from 15) - **80% faster!**
- ✅ **KYC**: Only when needed (contextual) - Not blocking exploration
- ✅ **Send Money**: 5 steps (down from 8) - 37% faster (after KYC)
- ✅ **Buy Crypto**: 4 steps (down from 7) - 43% faster (after KYC)
- ✅ **Link Bank**: 3 steps (down from 5) - 40% faster

### UX Enhancements:
- ✅ **Optimistic UI**: Show success immediately
- ✅ **Real-time Search**: Results as you type
- ✅ **One-tap Actions**: Quick amounts, recent contacts
- ✅ **Bottom Sheets**: Quick review/edit without full navigation
- ✅ **Social Login**: Pre-fills 60% of user info
- ✅ **Smart Address**: Auto-complete reduces typing

### Trust & Security:
- ✅ **Clear Security Messaging**: Explain why each step
- ✅ **Progress Indicators**: Show where user is in flow
- ✅ **Error Recovery**: Clear errors with retry options
- ✅ **Transparency**: Show fees upfront

---

## 📱 RESPONSIVE DESIGN NOTES

### iPhone (Small Screens):
- Bottom sheets for reviews
- Horizontal scroll for quick actions
- Collapsible sections
- Swipe gestures

### iPhone (Large Screens):
- More content visible
- Split view for details
- Larger touch targets

### Android:
- Material Design patterns
- System back button support
- Android share sheet
- Google Pay integration

---

## 🎨 EXPLORATION MODE DETAILS

### What Users Can Do Without KYC

#### Full Exploration Features:
```
✅ VIEW & BROWSE:
   • Dashboard with demo data (clearly marked)
   • Live crypto prices & charts
   • Portfolio visualization (demo)
   • Transaction examples
   • Feature tours
   • Educational content
   • Settings (limited)
   • Support & help

✅ INTERACT (Read-Only):
   • Scroll through demo transactions
   • Explore crypto prices
   • View charts and analytics
   • Browse contacts (if added)
   • Read FAQs and guides
   • Watch tutorials

❌ CANNOT DO:
   • Send real money
   • Receive real money
   • Buy/sell crypto
   • Add balance
   • Link bank account
   • Perform any real transactions
```

#### Exploration Mode UI Indicators:
- 🔵 "Demo Mode" badge on dashboard
- 💧 Watermark on demo balances
- ℹ️ Info tooltips explaining limitations
- 🎯 "Unlock" buttons on restricted features
- 📊 Live data clearly labeled (prices, charts)

### Progressive Feature Unlocking
```
User Journey Map:
┌─────────────────────────────────────────────┐
│ EXPLORATION MODE (3 steps)                 │
│ • Browse, learn, see demo data             │
│ • No restrictions on viewing               │
└─────────────────────────────────────────────┘
              ↓ User decides to transact
┌─────────────────────────────────────────────┐
│ VERIFICATION MODE (KYC)                    │
│ • Complete KYC to unlock transactions      │
│ • Takes 2 minutes                          │
└─────────────────────────────────────────────┘
              ↓ KYC complete
┌─────────────────────────────────────────────┐
│ FULL ACCESS                                │
│ • All features unlocked                    │
│ • Real transactions enabled                │
└─────────────────────────────────────────────┘
```

---

**Document Version:** 3.0  
**Last Updated:** November 2025  
**Next Review:** After MVP beta testing

*For MVP features list, see MVP_FEATURES_AND_FLOWS.md*

