# Environment Configuration Migration Guide

This guide documents the migration from hardcoded API URLs to environment-based configuration using `react-native-config`.

## Overview

The application now uses `react-native-config` to manage environment-specific configuration through `.env` files. This allows for:

- ✅ Different API URLs per environment (staging, production)
- ✅ Feature flags and configuration per environment
- ✅ Type-safe access to configuration values
- ✅ Automatic validation at app startup
- ✅ Separate Android app variants (staging/production can coexist)
- ✅ Separate iOS schemes with different configurations

## Installation Steps

### 1. Install react-native-config

```bash
npm install react-native-config@1.5.1
# or
yarn add react-native-config@1.5.1
```

### 2. Install iOS Pods

```bash
cd ios && pod install && cd ..
```

### 3. Verify Installation

The package should autolink automatically with React Native 0.77.1. No manual linking required.

## Environment Files

Three environment files have been created:

- `.env.staging` - Configuration for staging/testing environment
- `.env.production` - Configuration for production environment  
- `.env.example` - Template file (committed to git, used as reference)

**Important:** `.env.staging` and `.env.production` are excluded from git. Copy `.env.example` and fill in values for your environment.

## Configuration Structure

All environment variables are accessed through the type-safe `EnvConfig` module:

```typescript
import { EnvConfig, getApiBaseUrl, isStaging } from './src/config/env.config';

// Access configuration
const apiUrl = EnvConfig.API_BASE_URL;
const isProduction = !isStaging();

// Helper functions
const fullUrl = getApiBaseUrl();
```

## Android Configuration

### Product Flavors

The Android app now has two product flavors:

1. **staging** - Uses `.env.staging`
   - Application ID: `com.payairo.staging`
   - App Name: "PayAiro Staging"

2. **production** - Uses `.env.production`
   - Application ID: `com.payairo`
   - App Name: "PayAiro"

### Build Variants

Each flavor has debug and release variants:
- `stagingDebug` / `stagingRelease`
- `productionDebug` / `productionRelease`

### Building Android Apps

```bash
# Staging Debug
npm run android:staging:debug

# Staging Release
npm run android:staging:release

# Production Debug  
npm run android:production:debug

# Production Release
npm run android:production:release

# Build APK directly
cd android && ENVFILE=.env.staging ./gradlew assembleStagingRelease
```

## iOS Configuration

### Automatic Configuration

The `Podfile` is configured to automatically use:
- `.env.staging` for Debug builds
- `.env.production` for Release builds

### Building iOS Apps

```bash
# Staging (Debug)
npm run ios:staging:debug

# Staging (Release)
npm run ios:staging:release

# Production (Debug)
npm run ios:production:debug

# Production (Release)
npm run ios:production:release
```

### Manual Scheme Setup (Optional)

See `docs/IOS_ENV_SETUP.md` for detailed instructions on creating separate schemes.

## Code Changes

### Before (Hardcoded)

```typescript
// api/index.ts
const api = axios.create({
  baseURL: BASE_URL.testing, // ❌ Hardcoded
  timeout: Infinity,
});
```

### After (Environment-based)

```typescript
// api/index.ts
import { getApiBaseUrl, EnvConfig } from '../config/env.config';

const api = axios.create({
  baseURL: getApiBaseUrl(), // ✅ From environment
  timeout: EnvConfig.API_TIMEOUT,
});
```

## Migration Checklist

- [x] Install react-native-config
- [x] Create environment files (.env.staging, .env.production)
- [x] Update Android build.gradle with product flavors
- [x] Update iOS Podfile with environment mapping
- [x] Create TypeScript config module with validation
- [x] Refactor API service files
- [x] Convert mockData.js to TypeScript
- [x] Update package.json with build scripts
- [x] Update .gitignore to exclude .env files
- [ ] Install dependencies: `npm install`
- [ ] Install iOS pods: `cd ios && pod install`
- [ ] Test staging build on Android
- [ ] Test staging build on iOS
- [ ] Test production build on Android
- [ ] Test production build on iOS
- [ ] Verify both apps can coexist on same device
- [ ] Update any remaining files using old BASE_URL imports
- [ ] Add ConfigValidator to App.js (optional)

## Remaining Files to Update

The following files still import `BASE_URL` from `mockData.ts` and should be updated to use the config directly:

1. `src/components/BankModal2.js`
2. `src/screens/Dashboard/NewDashboard.tsx`
3. `src/screens/Dashboard/Dashboard.js`
4. `src/services/Api.js`

**Migration pattern:**
```typescript
// Before
import { BASE_URL } from '../constants/mockData';

// After
import { getApiBaseUrl } from '../config/env.config';
const BASE_URL = getApiBaseUrl();
```

## Testing & Verification

### Verification Checklist

- [ ] Both staging and production apps install simultaneously on same device
- [ ] Correct API URLs are used in each environment (check network requests)
- [ ] App names differ in launcher (Android: "PayAiro" vs "PayAiro Staging")
- [ ] Bundle/Application IDs are different
- [ ] No hardcoded URLs remain in codebase
- [ ] TypeScript compilation succeeds
- [ ] Runtime errors caught and logged appropriately
- [ ] Missing env vars trigger clear error messages
- [ ] Environment banner shows in staging (if enabled)

### Testing Commands

```bash
# Test Android staging
npm run android:staging:debug

# Test Android production
npm run android:production:debug

# Test iOS staging
npm run ios:staging:debug

# Test iOS production
npm run ios:production:debug
```

## Troubleshooting

### "Config is undefined" Errors

**Cause:** Environment file not loaded or react-native-config not linked.

**Solution:**
1. Ensure `.env.staging` or `.env.production` exists in project root
2. Run `cd ios && pod install`
3. Clean build: `cd android && ./gradlew clean`
4. Clear Metro cache: `npm start -- --reset-cache`

### Metro Bundler Cache Issues

**Solution:**
```bash
npm start -- --reset-cache
```

### iOS Scheme Not Picking Up Correct .env

**Solution:**
1. Verify Podfile has `ENVFILES` mapping configured
2. Run `cd ios && pod install`
3. Clean Xcode derived data: `Product > Clean Build Folder`
4. Check scheme's pre-action script (if manually configured)

### Android Flavor Not Applying Correct Config

**Solution:**
1. Verify `build.gradle` has `project.ext.envConfigFiles` configured
2. Ensure `.env.staging` exists in project root
3. Clean build: `cd android && ./gradlew clean`
4. Rebuild with explicit flavor: `./gradlew assembleStagingDebug`

### Type Errors After Migration

**Solution:**
1. Ensure `src/config/react-native-config.d.ts` exists
2. Restart TypeScript server in your IDE
3. Run `npx tsc --noEmit` to check for type errors

### Rebuild Requirements After Config Changes

After changing `.env` files:
- **Android:** Run `cd android && ./gradlew clean` then rebuild
- **iOS:** Clean build folder in Xcode (`Product > Clean Build Folder`)
- **Metro:** Restart Metro bundler with cache reset

## Common Pitfalls

1. **Don't commit `.env.staging` or `.env.production`** - These contain environment-specific values
2. **Always use lowercase for build variant names** in `envConfigFiles` mapping
3. **Bundle identifiers must be unique** - Staging uses `.staging` suffix for a reason
4. **Environment validation happens at module load** - Errors will crash the app early (which is good!)

## Next Steps

1. Complete the migration by updating remaining files that use old `BASE_URL`
2. Add `ConfigValidator` component to `App.js` for early validation
3. Set up CI/CD to inject environment variables during builds
4. Document environment-specific feature flags and their usage

## CI/CD Integration

For CI/CD pipelines, you can inject environment variables:

```yaml
# Example GitHub Actions
- name: Build Android Staging
  env:
    ENVFILE: .env.staging
  run: |
    cd android && ./gradlew assembleStagingRelease
```

Or create environment files on-the-fly:
```bash
echo "API_BASE_URL=${{ secrets.STAGING_API_URL }}" > .env.staging
```

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review `docs/IOS_ENV_SETUP.md` for iOS-specific issues
3. Check react-native-config documentation: https://github.com/lugg/react-native-config