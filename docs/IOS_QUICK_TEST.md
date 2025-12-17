# Quick iOS Testing Guide

## 🚀 Fastest Way to Test (3 Steps)

### Step 1: Run Test Script
```bash
./test-env-config.sh
```
This will check if everything is set up correctly.

### Step 2: Test Staging Build
```bash
npm run ios:staging:debug
```

### Step 3: Check Console Logs
Look for this in your console/terminal:
```
=== ENVIRONMENT CONFIG TEST ===
ENV_NAME: staging
ENV_TYPE: testing
API_BASE_URL: https://testingapp.payairo.com/api/
APP_NAME: PayAiro (Staging)
=================================
```

## ✅ What to Look For

### ✅ SUCCESS Indicators:
1. ✅ App builds without errors
2. ✅ App launches on simulator/device
3. ✅ Console shows environment config test log
4. ✅ ENV_NAME shows "staging" or "production"
5. ✅ API_BASE_URL matches your .env file

### ❌ FAILURE Indicators:
1. ❌ App crashes on startup
2. ❌ Console shows "Config is undefined"
3. ❌ All values are empty or undefined
4. ❌ Build errors related to react-native-config

## 🔍 Quick Verification

### Check Console Output
When the app starts, you should immediately see:
```
=== ENVIRONMENT CONFIG TEST ===
ENV_NAME: staging
ENV_TYPE: testing
API_BASE_URL: https://testingapp.payairo.com/api/
APP_NAME: PayAiro (Staging)
=================================
```

### Check Network Requests
1. Open React Native Debugger or Network tab
2. Make an API call in your app
3. Verify the base URL matches:
   - **Staging:** `https://testingapp.payairo.com/api/`
   - **Production:** `https://app.payairo.com/api/`

## 🛠️ Troubleshooting

### If values are undefined:
1. **Reinstall pods:**
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Clean build:**
   - In Xcode: Product > Clean Build Folder
   - Restart Metro: `npm start -- --reset-cache`

3. **Verify .env files exist:**
   ```bash
   ls -la .env.staging .env.production
   ```

### If build fails:
1. **Check react-native-config is installed:**
   ```bash
   npm list react-native-config
   ```

2. **Reinstall if needed:**
   ```bash
   npm install react-native-config@1.6.1
   cd ios && pod install && cd ..
   ```

## 📋 Testing Checklist

- [ ] Test script runs successfully (`./test-env-config.sh`)
- [ ] Staging build works (`npm run ios:staging:debug`)
- [ ] Console shows config values
- [ ] Production build works (`npm run ios:production:debug`)
- [ ] API requests use correct URLs
- [ ] No errors in console

## 🎯 Expected Results

### Staging Build Should Show:
- ENV_NAME: `staging`
- ENV_TYPE: `testing`
- API_BASE_URL: `https://testingapp.payairo.com/api/`
- APP_NAME: `PayAiro (Staging)`

### Production Build Should Show:
- ENV_NAME: `production`
- ENV_TYPE: `production`
- API_BASE_URL: `https://app.payairo.com/api/`
- APP_NAME: `PayAiro`

---

**Need more details?** See `docs/IOS_TESTING_GUIDE.md`