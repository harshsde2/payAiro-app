# iOS Environment Configuration Testing Guide

This guide provides step-by-step instructions to test and verify that environment configuration is working correctly on iOS.

## Prerequisites

1. ✅ `react-native-config` is installed (`npm install react-native-config@1.6.1`)
2. ✅ iOS pods are installed (`cd ios && pod install`)
3. ✅ Environment files exist (`.env.staging` and `.env.production`)

## Quick Test Steps

### Step 1: Install Pods (If Not Done)

```bash
cd ios && pod install && cd ..
```

### Step 2: Test Staging Build (Debug)

```bash
npm run ios:staging:debug
```

**Expected Result:**
- App should build and launch
- Check console logs for: `[EnvConfig] Configuration loaded successfully`
- Verify ENV_NAME is "staging"

### Step 3: Test Production Build (Debug)

```bash
npm run ios:production:debug
```

**Expected Result:**
- App should build and launch
- Check console logs for: `[EnvConfig] Configuration loaded successfully`
- Verify ENV_NAME is "production"

## Detailed Verification

### Method 1: Console Logs

1. **Open Xcode Console** or React Native Debugger
2. **Run the app** with:
   ```bash
   npm run ios:staging:debug
   ```
3. **Look for these logs:**
   ```
   [EnvConfig] Configuration loaded successfully: {
     ENV_NAME: 'staging',
     ENV_TYPE: 'testing',
     API_BASE_URL: 'https://testingapp.payairo.com/api/',
     ENABLE_LOGGING: true
   }
   ```

### Method 2: Add Test Screen (Recommended)

Add the test screen to your app temporarily:

1. **Import the test component in App.js:**
   ```javascript
   import EnvConfigTestScreen from './src/components/common-components/EnvConfigTestScreen';
   ```

2. **Add a temporary button or route to show it:**
   ```javascript
   // In your App component, temporarily show test screen
   // Or add it to your navigation stack
   ```

3. **Run the app** and navigate to the test screen

4. **Verify all values are displayed correctly:**
   - ENV_NAME should match your environment file
   - API_BASE_URL should match `.env.staging` or `.env.production`
   - All feature flags should show correct values

### Method 3: Check Network Requests

1. **Enable Network Inspector:**
   - Open React Native Debugger
   - Or use Xcode Network Inspector
   - Or check Metro bundler logs

2. **Trigger an API call** in your app

3. **Verify the base URL:**
   - Staging: Should use `https://testingapp.payairo.com/api/`
   - Production: Should use `https://app.payairo.com/api/`

## Verification Checklist

Run through this checklist for each environment:

### Staging Environment (Debug Build)

- [ ] App builds without errors
- [ ] App launches successfully
- [ ] Console shows: `[EnvConfig] Configuration loaded successfully`
- [ ] ENV_NAME = "staging"
- [ ] ENV_TYPE = "testing"
- [ ] API_BASE_URL = "https://testingapp.payairo.com/api/"
- [ ] ENABLE_LOGGING = true
- [ ] SHOW_ENV_BANNER = true (if enabled)
- [ ] Network requests use staging URL
- [ ] Environment banner shows (if enabled)

### Production Environment (Release Build)

- [ ] App builds without errors
- [ ] App launches successfully
- [ ] ENV_NAME = "production"
- [ ] ENV_TYPE = "production"
- [ ] API_BASE_URL = "https://app.payairo.com/api/"
- [ ] ENABLE_LOGGING = false
- [ ] Network requests use production URL

## Testing Commands

### Build and Run Staging (Debug)
```bash
ENVFILE=.env.staging react-native run-ios --scheme=payAiro
# or
npm run ios:staging:debug
```

### Build and Run Production (Debug)
```bash
ENVFILE=.env.production react-native run-ios --scheme=payAiro
# or
npm run ios:production:debug
```

### Build Release Staging
```bash
ENVFILE=.env.staging react-native run-ios --scheme=payAiro --configuration=Release
# or
npm run ios:staging:release
```

### Build Release Production
```bash
ENVFILE=.env.production react-native run-ios --scheme=payAiro --configuration=Release
# or
npm run ios:production:release
```

## Troubleshooting

### Issue: "Config is undefined" or Empty Values

**Possible Causes:**
1. Environment file not found
2. Pods not installed
3. Build configuration mismatch

**Solutions:**

1. **Verify .env file exists:**
   ```bash
   ls -la .env.staging .env.production
   ```

2. **Reinstall pods:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

3. **Check Podfile configuration:**
   - Ensure `ENVFILES` mapping is correct:
     ```ruby
     ENVFILES = {
       'Debug' => '$(PODS_ROOT)/../../.env.staging',
       'Release' => '$(PODS_ROOT)/../../.env.production',
     }
     ```

4. **Clean and rebuild:**
   ```bash
   # Clean Xcode build
   # In Xcode: Product > Clean Build Folder
   
   # Clean Metro cache
   npm start -- --reset-cache
   ```

### Issue: Wrong Environment Values

**Check:**
1. Which `.env` file is being used
2. Build configuration (Debug vs Release)
3. ENVFILE environment variable override

**Solution:**
- Explicitly set ENVFILE when running:
  ```bash
  ENVFILE=.env.staging react-native run-ios
  ```

### Issue: Build Errors Related to Config

**Possible Causes:**
1. react-native-config not installed
2. Pod installation failed
3. TypeScript errors

**Solutions:**

1. **Verify installation:**
   ```bash
   npm list react-native-config
   ```

2. **Check pod installation:**
   ```bash
   cd ios
   pod install
   # Check for errors
   cd ..
   ```

3. **Check TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

## Quick Test Script

Create a simple test by adding this to your App.js temporarily:

```javascript
import { EnvConfig } from './src/config/env.config';

// Add this at the top of your App component
useEffect(() => {
  console.log('=== ENVIRONMENT CONFIG TEST ===');
  console.log('ENV_NAME:', EnvConfig.ENV_NAME);
  console.log('ENV_TYPE:', EnvConfig.ENV_TYPE);
  console.log('API_BASE_URL:', EnvConfig.API_BASE_URL);
  console.log('APP_NAME:', EnvConfig.APP_NAME);
  console.log('===============================');
}, []);
```

## Expected Console Output

When the app starts, you should see:

```
[EnvConfig] Configuration loaded successfully: {
  ENV_NAME: 'staging',
  ENV_TYPE: 'testing',
  API_BASE_URL: 'https://testingapp.payairo.com/api/',
  ENABLE_LOGGING: true
}
```

## Success Indicators

✅ **Configuration is working if:**
- App builds and launches without errors
- Console shows configuration loaded successfully
- API requests use correct base URL
- Environment-specific values are correct
- No "undefined" or missing values

❌ **Configuration is NOT working if:**
- App crashes on startup with config errors
- Console shows "Config is undefined"
- API requests fail or use wrong URL
- All values are undefined or empty

## Next Steps

Once verified:
1. Remove test components/logs (if added)
2. Test with actual API calls
3. Verify both staging and production builds work
4. Test on physical device (not just simulator)

---

**Need Help?** Check:
- Migration guide: `docs/ENVIRONMENT_MIGRATION_GUIDE.md`
- iOS setup: `docs/IOS_ENV_SETUP.md`