# Quick Start: Environment Configuration Setup

## 🚀 Installation (One-Time Setup)

### Step 1: Install react-native-config

```bash
npm install react-native-config@1.5.1
# or if using yarn:
yarn add react-native-config@1.5.1
```

### Step 2: Install iOS Dependencies

```bash
cd ios && pod install && cd ..
```

### Step 3: Verify Environment Files Exist

Ensure these files exist in your project root:
- ✅ `.env.staging` (for staging/testing)
- ✅ `.env.production` (for production)

If they don't exist, copy from `.env.example` and fill in your values.

## 🏃 Running the App

### Android

```bash
# Staging (uses .env.staging)
npm run android:staging:debug

# Production (uses .env.production)
npm run android:production:debug
```

### iOS

```bash
# Staging (Debug - uses .env.staging automatically)
npm run ios:staging:debug

# Production (Debug - uses .env.production automatically)
npm run ios:production:debug
```

## 📦 Building Release Versions

### Android

```bash
# Staging Release APK
npm run android:staging:release

# Production Release APK
npm run android:production:release
```

### iOS

```bash
# Staging Release
npm run ios:staging:release

# Production Release
npm run ios:production:release
```

## ✅ Verification

After installation, verify:

1. **Both apps can coexist** (Android):
   ```bash
   npm run android:staging:debug
   npm run android:production:debug
   ```
   Both should install with different names and IDs.

2. **Check API URL**:
   - Open app
   - Check network requests in debugger
   - Staging should use: `https://testingapp.payairo.com/api/`
   - Production should use: `https://app.payairo.com/api/`

3. **TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

## 🐛 Common Issues

### Metro Bundler Cache
```bash
npm start -- --reset-cache
```

### Android Clean Build
```bash
cd android && ./gradlew clean && cd ..
```

### iOS Clean Build
In Xcode: `Product > Clean Build Folder`

## 📚 More Information

- Full migration guide: `docs/ENVIRONMENT_MIGRATION_GUIDE.md`
- iOS setup details: `docs/IOS_ENV_SETUP.md`
- Implementation summary: `docs/ENV_CONFIG_SUMMARY.md`