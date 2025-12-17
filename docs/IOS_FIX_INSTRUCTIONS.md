# iOS Production Debug Fix Instructions

## Problem
`npm run ios:production:debug` was using staging URL because Podfile hardcoded Debug builds to `.env.staging`.

## Solution
Podfile ENVFILES mapping has been removed. Now it relies on `ENVFILE` environment variable from npm scripts.

## Steps to Fix

### 1. Reinstall iOS Pods
```bash
cd ios
pod install
cd ..
```

### 2. Clean Build
In Xcode:
- Open Xcode
- Product > Clean Build Folder (Shift+Cmd+K)

Or via terminal:
```bash
# Clean Metro bundler cache
npm start -- --reset-cache
```

### 3. Test Production Build
```bash
npm run ios:production:debug
```

### 4. Verify in Console
You should now see:
```
=== ENVIRONMENT CONFIG TEST ===
ENV_NAME: production  ✅ (was showing "staging" before)
ENV_TYPE: production
API_BASE_URL: https://app.payairo.com/api/  ✅ (was showing staging URL)
APP_NAME: PayAiro
=================================
```

### 5. Test Staging Build (Should Still Work)
```bash
npm run ios:staging:debug
```

Should show:
```
=== ENVIRONMENT CONFIG TEST ===
ENV_NAME: staging
ENV_TYPE: testing
API_BASE_URL: https://testingapp.payairo.com/api/
APP_NAME: PayAiro (Staging)
=================================
```

## How It Works Now

- **npm run ios:staging:debug** → `ENVFILE=.env.staging` → Uses `.env.staging`
- **npm run ios:production:debug** → `ENVFILE=.env.production` → Uses `.env.production`

The `ENVFILE` environment variable is passed to Metro bundler, which reads the correct `.env` file at JavaScript runtime.

## If It Still Doesn't Work

1. **Make sure .env files exist:**
   ```bash
   ls -la .env.staging .env.production
   ```

2. **Verify npm script:**
   Check `package.json` - should have:
   ```json
   "ios:production:debug": "ENVFILE=.env.production react-native run-ios --scheme=payAiro"
   ```

3. **Check Metro bundler:**
   Make sure Metro is restarted with the ENVFILE env var:
   ```bash
   # Stop Metro (Ctrl+C)
   # Then run:
   npm run ios:production:debug
   ```

4. **Verify console output:**
   Look for the config test log when app starts - it should show production values.

---

**Note:** After pod install, you might need to rebuild the app for changes to take effect.