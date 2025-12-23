# iOS TestFlight Build Fix - Environment Configuration

## Problem
When creating archives for TestFlight, the app was using the wrong environment (staging instead of production) even when using the correct scheme.

## Root Cause
When archiving in Xcode, `react-native-config` reads the `.env` file at **native build time** (during compilation), not just at JavaScript runtime. The pre-action scripts in the schemes copy the correct `.env` file, but `react-native-config` needs to be explicitly configured via the Podfile's `ENVFILES` mapping to use the correct file based on the build configuration.

## Solution
Updated the `Podfile` to map build configurations to the correct `.env` files:

- **Debug** → `.env.staging`
- **Release** → `.env.production` (used by "payAiro 1" scheme)
- **StagingRelease** → `.env.staging` (used by "payAiro staging" scheme)

This ensures that when archiving, `react-native-config` reads the correct environment file at native build time.

## Steps to Apply the Fix

### 1. Reinstall iOS Pods
```bash
cd ios
pod install
cd ..
```

### 2. Clean Build Folder in Xcode
- Open Xcode
- Product > Clean Build Folder (Shift+Cmd+K)

### 3. Verify Scheme Configuration
Make sure your schemes are set up correctly:

**For Staging Archive:**
- Scheme: `payAiro staging`
- Build Configuration: `StagingRelease` (should be automatic)
- Pre-action script: Copies `.env.staging` to `.env`

**For Production Archive:**
- Scheme: `payAiro 1`
- Build Configuration: `Release` (should be automatic)
- Pre-action script: Copies `.env.production` to `.env`

### 4. Create Archive

**For Staging:**
1. Select scheme: `payAiro staging`
2. Product > Archive
3. The pre-action script will copy `.env.staging` to `.env`
4. The Podfile ENVFILES mapping ensures `react-native-config` uses `.env.staging` at native build time

**For Production:**
1. Select scheme: `payAiro 1`
2. Product > Archive
3. The pre-action script will copy `.env.production` to `.env`
4. The Podfile ENVFILES mapping ensures `react-native-config` uses `.env.production` at native build time

## How It Works Now

### Development (npm scripts)
- `npm run ios:staging:debug` → Sets `ENVFILE=.env.staging` → Metro uses staging
- `npm run ios:production:debug` → Sets `ENVFILE=.env.production` → Metro uses production

### Archive/TestFlight (Xcode)
- **Staging scheme** → Uses `StagingRelease` config → ENVFILES maps to `.env.staging`
- **Production scheme** → Uses `Release` config → ENVFILES maps to `.env.production`

Both mechanisms work together:
1. Pre-action script copies the correct `.env` file (safety net)
2. Podfile ENVFILES mapping ensures `react-native-config` uses the correct file at native build time

## Verification

After creating an archive, you can verify the environment by:

1. **Check the build log** - You should see:
   ```
   ✓ react-native-config: Release → $(PODS_ROOT)/../../.env.production
   ```
   or
   ```
   ✓ react-native-config: StagingRelease → $(PODS_ROOT)/../../.env.staging
   ```

2. **Test the app** - After uploading to TestFlight and installing:
   - Check the API URL in network requests
   - Verify environment-specific features (logging, banners, etc.)

## Troubleshooting

### Still seeing wrong environment after fix

1. **Clean everything:**
   ```bash
   # Clean Xcode build folder
   # Product > Clean Build Folder in Xcode
   
   # Clean Metro cache
   npm start -- --reset-cache
   
   # Reinstall pods
   cd ios && pod install && cd ..
   ```

2. **Verify .env files exist:**
   ```bash
   ls -la .env.staging .env.production
   ```

3. **Check scheme build configuration:**
   - Open scheme editor (Product > Scheme > Edit Scheme...)
   - Go to Archive section
   - Verify Build Configuration matches:
     - Staging scheme → `StagingRelease`
     - Production scheme → `Release`

4. **Verify Podfile was updated:**
   - Check that `ENVFILES` mapping is present
   - Check that `post_install` block configures `react-native-config`

### Archive fails to build

- Make sure you've run `pod install` after updating the Podfile
- Check that both `.env.staging` and `.env.production` files exist
- Verify the paths in ENVFILES mapping are correct

