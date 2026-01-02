# Universal Links & App Links Setup Guide

This folder contains the server-side files needed for Universal Links (iOS) and App Links (Android) to work.

## 📁 Directory Structure

```
server-upload/
├── .well-known/
│   ├── apple-app-site-association  (iOS Universal Links)
│   └── assetlinks.json             (Android App Links)
├── ref/
│   └── index.html                  (Fallback landing page for referrals)
└── README.md
```

## 🚀 Server Deployment

### Step 1: Upload Files to Your Server

Upload the contents of this `server-upload` folder to the root of your web server at `https://payairo.com/`

The files should be accessible at:
- `https://payairo.com/.well-known/apple-app-site-association`
- `https://payairo.com/.well-known/assetlinks.json`
- `https://payairo.com/ref/[CODE]` (for the landing page)

### Step 2: Configure Web Server

#### For Nginx:
```nginx
# Serve apple-app-site-association without .json extension
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
}

# Handle referral deep links with dynamic path
location ~ ^/ref/(.+)$ {
    try_files /ref/index.html =404;
}
```

#### For Apache (.htaccess):
```apache
# Serve apple-app-site-association with correct content type
<Files "apple-app-site-association">
    Header set Content-Type "application/json"
</Files>

# Rewrite /ref/CODE to /ref/index.html
RewriteEngine On
RewriteRule ^ref/(.+)$ /ref/index.html [L]
```

#### For Express.js (Node.js):
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve .well-known files
app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
  setHeaders: (res, filePath) => {
    if (filePath.includes('apple-app-site-association')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Handle referral deep links
app.get('/ref/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'ref', 'index.html'));
});
```

### Step 3: Update Configuration Files

#### iOS (apple-app-site-association):
1. Replace `YOUR_TEAM_ID_HERE` with your Apple Developer Team ID
2. Find your Team ID at: https://developer.apple.com/account → Membership

#### Android (assetlinks.json):
1. Replace `YOUR_SHA256_FINGERPRINT_HERE` with your release keystore SHA256
2. Generate SHA256 fingerprint:
```bash
# For release keystore
keytool -list -v -keystore android/app/payairo.keystore -alias payairo -storepass YOUR_PASSWORD

# For debug keystore
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android
```

## 🧪 Testing Commands

### Test on iOS Simulator

```bash
# Test custom URL scheme
xcrun simctl openurl booted "payairo://ref/TESTCODE"

# Test Universal Link (Note: Simulator has limited Universal Link support)
# For full testing, use a physical device
xcrun simctl openurl booted "https://payairo.com/ref/TESTCODE"
```

### Test on Android Emulator

```bash
# Test custom URL scheme
adb shell am start -a android.intent.action.VIEW -d "payairo://ref/TESTCODE"

# Test App Link
adb shell am start -a android.intent.action.VIEW -d "https://payairo.com/ref/TESTCODE"

# Verify App Links are configured correctly
adb shell pm get-app-links com.payairo

# Clear App Links state (useful for re-testing)
adb shell pm set-app-links --package com.payairo 0 all
```

### Test on Physical Device

#### iOS:
1. Send yourself a message with the link: `https://payairo.com/ref/TESTCODE`
2. Tap the link in Messages or Notes app
3. The PayAiro app should open

#### Android:
1. Send yourself a message with the link: `https://payairo.com/ref/TESTCODE`
2. Tap the link
3. Android should show a chooser or open the app directly

### Verify Server Configuration

```bash
# Check iOS apple-app-site-association
curl -I https://payairo.com/.well-known/apple-app-site-association

# Check Android assetlinks.json  
curl -I https://payairo.com/.well-known/assetlinks.json

# Use Apple's validation tool
# Visit: https://app.links.apple.com/validator

# Use Google's validation tool
# Visit: https://developers.google.com/digital-asset-links/tools/generator
```

## 📱 Xcode Configuration (IMPORTANT)

You must enable Associated Domains capability in Xcode:

1. Open `ios/payAiro.xcworkspace` in Xcode
2. Select the **payAiro** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability** button
5. Add **Associated Domains**
6. Add these domains:
   - `applinks:payairo.com`
   - `applinks:www.payairo.com`
   - `webcredentials:payairo.com`

The entitlements file (`payAiro.entitlements`) has been created, but you must link it in Xcode:
1. In Xcode, select the target
2. Go to **Build Settings**
3. Search for **Code Signing Entitlements**
4. Set the value to `payAiro/payAiro.entitlements`

## 🔧 Troubleshooting

### iOS Universal Links Not Working

1. **Clear cache**: Delete the app and reinstall
2. **Check AASA**: Use Apple's validator tool
3. **Check entitlements**: Ensure Associated Domains are configured in Xcode
4. **HTTPS required**: Universal Links only work with HTTPS
5. **Same domain restriction**: Links must be on a different domain than your website

### Android App Links Not Working

1. **Verify SHA256**: Run `adb shell pm get-app-links com.payairo`
2. **Clear state**: `adb shell pm set-app-links --package com.payairo 0 all`
3. **Check assetlinks.json**: Use Google's validation tool
4. **Reinstall app**: Uninstall and reinstall after server changes
5. **Wait for verification**: Android may take time to verify app links

### Common Issues

| Issue | Solution |
|-------|----------|
| Link opens in browser | Check AASA/assetlinks.json is accessible and valid |
| 404 on server files | Ensure .well-known folder is accessible publicly |
| Wrong content-type | Configure server to serve application/json |
| App not opening | Ensure app is installed and properly signed |

## 📊 Link Format Reference

| Type | Format | Example |
|------|--------|---------|
| Custom Scheme | `payairo://path` | `payairo://ref/ABC123` |
| Universal Link | `https://payairo.com/path` | `https://payairo.com/ref/ABC123` |
| Referral | `https://payairo.com/ref/{code}` | `https://payairo.com/ref/john_doe` |

## ✅ Checklist

- [ ] Upload `.well-known/` folder to server
- [ ] Update `apple-app-site-association` with correct Team ID
- [ ] Update `assetlinks.json` with correct SHA256 fingerprint
- [ ] Configure web server to serve files with correct content-type
- [ ] Enable Associated Domains in Xcode
- [ ] Link entitlements file in Xcode build settings
- [ ] Test on iOS simulator/device
- [ ] Test on Android emulator/device
- [ ] Update App Store / Play Store listing URLs

