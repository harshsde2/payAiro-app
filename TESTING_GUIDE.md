# Universal Links & App Links Testing Guide

## ✅ Step 1: Verify Server Files Are Accessible

Before testing the app, verify your server files are correctly uploaded and accessible:

### Test Server Files

```bash
# Test iOS configuration file
curl -I https://payairo.com/.well-known/apple-app-site-association

# Expected: HTTP/1.1 200 OK
# Content-Type: application/json (IMPORTANT!)

# Test Android configuration file
curl -I https://payairo.com/.well-known/assetlinks.json

# Expected: HTTP/1.1 200 OK
# Content-Type: application/json

# Test landing page
curl https://payairo.com/ref/TESTCODE

# Should return HTML content
```

### Verify Content-Type Headers

**CRITICAL**: The `apple-app-site-association` file MUST be served with `Content-Type: application/json`

```bash
# Check content type
curl -I https://payairo.com/.well-known/apple-app-site-association | grep -i content-type

# Should show: Content-Type: application/json
```

If it shows `text/plain` or `text/html`, your server configuration needs to be fixed.

---

## 📱 Step 2: Test on Android

### Option A: Android Emulator

```bash
# Make sure your app is installed on the emulator
# Then test the App Link:

adb shell am start -a android.intent.action.VIEW -d "https://payairo.com/ref/TESTCODE"

# Expected: App should open directly (not browser)
```

### Option B: Physical Android Device

1. **Send yourself a link** via WhatsApp, SMS, or email:
   ```
   https://payairo.com/ref/TESTCODE
   ```

2. **Tap the link** - The PayAiro app should open directly

3. **If it opens in browser instead:**
   - Wait 20-30 minutes after uploading files (Android needs time to verify)
   - Check verification status:
     ```bash
     adb shell pm get-app-links com.payairo
     ```
   - Clear and reset App Links:
     ```bash
     adb shell pm set-app-links --package com.payairo 0 all
     adb shell pm verify-app-links --re-verify com.payairo
     ```

### Verify Android App Links Status

```bash
# Check if App Links are verified
adb shell pm get-app-links com.payairo

# Should show:
# com.payairo:
#   ID: ...
#   Signatures: [YOUR_SHA256]
#   Domain verification state:
#     payairo.com: verified
```

---

## 🍎 Step 3: Test on iOS

### Option A: iOS Simulator (Limited Support)

```bash
# Test custom URL scheme (always works)
xcrun simctl openurl booted "payairo://ref/TESTCODE"

# Test Universal Link (may not work fully in simulator)
xcrun simctl openurl booted "https://payairo.com/ref/TESTCODE"
```

**Note**: iOS Simulator has limited Universal Links support. For full testing, use a physical device.

### Option B: Physical iOS Device (Recommended)

1. **Make sure you've configured Xcode:**
   - ✅ Associated Domains capability enabled
   - ✅ Entitlements file linked in Build Settings
   - ✅ App rebuilt and installed

2. **Send yourself a link** via:
   - **Notes app** (best for testing)
   - **Messages** (iMessage)
   - **Mail**
   - **Safari** (type the URL)

3. **Tap the link** - The PayAiro app should open directly

4. **If it opens in Safari instead:**
   - Delete the app and reinstall (clears Universal Links cache)
   - Make sure Associated Domains are configured in Xcode
   - Check that entitlements file is linked

### Verify iOS Universal Links

```bash
# On your Mac, check if Universal Links are working
# Open Console.app and filter for "swcd" (Smart Web Content Daemon)
# Look for verification messages
```

---

## 🧪 Step 4: Test Deep Link Handler

Once the app opens, verify the referral code is being captured:

### Check Logs

```bash
# Android
adb logcat | grep -i "deep link\|referral"

# iOS (in Xcode console)
# Look for: "Deep link received: https://payairo.com/ref/TESTCODE"
# Look for: "Referral code found: TESTCODE"
```

### Verify Code Storage

The referral code should be stored in MMKV storage. Check your app's signup flow to see if it's using the stored referral code.

---

## 🔍 Step 5: Online Validation Tools

### Apple's Validator (iOS)

1. Go to: https://app.links.apple.com/validator
2. Enter your domain: `payairo.com`
3. Click "Validate"
4. Should show: ✅ "Valid" with your app IDs listed

### Google's Validator (Android)

1. Go to: https://developers.google.com/digital-asset-links/tools/generator
2. Enter:
   - **Package name**: `com.payairo`
   - **SHA256 fingerprint**: Your keystore fingerprint
   - **Domain**: `payairo.com`
3. Click "Generate Statement"
4. Compare with your `assetlinks.json` file

---

## 🐛 Troubleshooting

### Problem: Link opens in browser instead of app

**Android:**
- ✅ Wait 20-30 minutes after server upload
- ✅ Verify `assetlinks.json` is accessible
- ✅ Check SHA256 fingerprint matches
- ✅ Reinstall app after server changes

**iOS:**
- ✅ Delete app and reinstall (clears cache)
- ✅ Verify Associated Domains in Xcode
- ✅ Check entitlements file is linked
- ✅ Ensure `apple-app-site-association` has correct Content-Type

### Problem: 404 error on server files

- ✅ Check `.well-known` folder is uploaded correctly
- ✅ Verify file permissions (should be readable)
- ✅ Check server configuration allows `.well-known` path

### Problem: "Cannot verify" error

**iOS:**
- ✅ Check Team ID in `apple-app-site-association` matches your Apple Developer account
- ✅ Verify app bundle ID matches

**Android:**
- ✅ Check SHA256 fingerprint matches your release keystore
- ✅ Verify package name matches

### Problem: App opens but referral code not captured

- ✅ Check app logs for deep link handler messages
- ✅ Verify `deepLinkHandler.ts` is initialized in `App.js`
- ✅ Check URL format matches: `https://payairo.com/ref/CODE`

---

## ✅ Success Checklist

- [ ] Server files accessible via HTTPS
- [ ] `apple-app-site-association` served with `application/json` content-type
- [ ] `assetlinks.json` accessible
- [ ] Android: App Links verified (check with `pm get-app-links`)
- [ ] iOS: Associated Domains configured in Xcode
- [ ] App rebuilt and installed on device
- [ ] Link opens app directly (not browser)
- [ ] Referral code captured in logs
- [ ] Referral code stored in MMKV

---

## 🎯 Quick Test Commands

```bash
# 1. Verify server files
curl -I https://payairo.com/.well-known/apple-app-site-association
curl -I https://payairo.com/.well-known/assetlinks.json

# 2. Test Android
adb shell am start -a android.intent.action.VIEW -d "https://payairo.com/ref/TESTCODE"

# 3. Test iOS (simulator)
xcrun simctl openurl booted "https://payairo.com/ref/TESTCODE"

# 4. Check Android verification
adb shell pm get-app-links com.payairo
```

---

## 📝 Notes

- **Android verification** can take 20-30 minutes after server upload
- **iOS Universal Links** work best on physical devices (simulator has limitations)
- **Content-Type headers** are critical - must be `application/json`
- **HTTPS is required** - Universal/App Links don't work with HTTP
- **Reinstall app** after server changes to clear caches

