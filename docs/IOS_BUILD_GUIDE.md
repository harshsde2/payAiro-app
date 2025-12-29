# iOS Build Guide

This guide explains how to build the iOS app for different environments (staging and production) with the correct app names.

## App Names by Configuration

- **Production (Release)**: "PayAiro"
- **Staging (StagingRelease)**: "PayAiro Staging"
- **Debug**: "PayAiro" (uses production name)

## Method 1: Using npm Scripts (Recommended)

### Staging Builds

**Debug Build (for development/testing):**
```bash
npm run ios:staging:debug
```
- App Name: "PayAiro Staging"
- Environment: Staging (.env.staging)
- Configuration: Debug
- Scheme: "payAiro staging"

**Release Build (for distribution):**
```bash
npm run ios:staging:release
```
- App Name: "PayAiro Staging"
- Environment: Staging (.env.staging)
- Configuration: StagingRelease
- Scheme: "payAiro staging"

### Production Builds

**Debug Build (for development/testing):**
```bash
npm run ios:production:debug
```
- App Name: "PayAiro"
- Environment: Production (.env.production)
- Configuration: Debug
- Scheme: payAiro

**Release Build (for App Store/TestFlight):**
```bash
npm run ios:production:release
```
- App Name: "PayAiro"
- Environment: Production (.env.production)
- Configuration: Release
- Scheme: payAiro

## Method 2: Using Xcode GUI

### Building for Staging

1. **Open Xcode:**
   ```bash
   cd ios
   open payAiro.xcworkspace
   ```

2. **Select the Staging Scheme:**
   - At the top of Xcode, click the scheme dropdown (next to the play/stop buttons)
   - Select **"payAiro staging"**

3. **Select Build Configuration:**
   - Go to **Product > Scheme > Edit Scheme...**
   - Select **Run** in the left sidebar
   - Under **Build Configuration**, select:
     - **Debug** for development builds
     - **StagingRelease** for release builds (will show "PayAiro Staging")

4. **Build and Run:**
   - Press `Cmd + R` to build and run
   - Or go to **Product > Build** (`Cmd + B`) to just build

### Building for Production

1. **Select the Production Scheme:**
   - At the top of Xcode, select **"payAiro"** scheme

2. **Select Build Configuration:**
   - Go to **Product > Scheme > Edit Scheme...**
   - Select **Run** in the left sidebar
   - Under **Build Configuration**, select:
     - **Debug** for development builds
     - **Release** for release builds (will show "PayAiro")

3. **Build and Run:**
   - Press `Cmd + R` to build and run
   - Or go to **Product > Build** (`Cmd + B`) to just build

### Creating Archive for Distribution

#### Staging Archive (PayAiro Staging)

1. Select **"payAiro staging"** scheme
2. Go to **Product > Archive**
3. The archive will use **StagingRelease** configuration automatically
4. App name will be "PayAiro Staging"

#### Production Archive (PayAiro)

1. Select **"payAiro"** scheme
2. Go to **Product > Archive**
3. The archive will use **Release** configuration automatically
4. App name will be "PayAiro"

## Method 3: Using Command Line (xcodebuild)

### Staging Build

**Debug:**
```bash
cd ios
xcodebuild -workspace payAiro.xcworkspace \
  -scheme "payAiro staging" \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build
```

**Release (StagingRelease):**
```bash
cd ios
xcodebuild -workspace payAiro.xcworkspace \
  -scheme "payAiro staging" \
  -configuration StagingRelease \
  -sdk iphoneos \
  -archivePath build/payAiro-staging.xcarchive \
  archive
```

### Production Build

**Debug:**
```bash
cd ios
xcodebuild -workspace payAiro.xcworkspace \
  -scheme payAiro \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build
```

**Release:**
```bash
cd ios
xcodebuild -workspace payAiro.xcworkspace \
  -scheme payAiro \
  -configuration Release \
  -sdk iphoneos \
  -archivePath build/payAiro-production.xcarchive \
  archive
```

## Verifying App Name

After building, you can verify the app name:

1. **On Simulator/Device:**
   - Install the app
   - Check the home screen - the app name should match:
     - "PayAiro" for production builds
     - "PayAiro Staging" for staging builds

2. **In Xcode:**
   - Select your target
   - Go to **Build Settings**
   - Search for "CFBundleDisplayName" or "INFOPLIST_KEY_CFBundleDisplayName"
   - Verify the value matches your configuration

## Troubleshooting

### App Name Not Changing

1. **Clean Build Folder:**
   - In Xcode: **Product > Clean Build Folder** (`Shift + Cmd + K`)
   - Or via terminal: `cd ios && xcodebuild clean`

2. **Delete Derived Data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

3. **Rebuild:**
   - Close Xcode
   - Reopen and rebuild

### Wrong Environment File Loading

1. **Check .env files exist:**
   ```bash
   ls -la .env.staging .env.production
   ```

2. **Verify Podfile configuration:**
   - Check `ios/Podfile` has correct ENVFILES mapping
   - Run `cd ios && pod install`

3. **Check scheme pre-actions:**
   - In Xcode, go to **Product > Scheme > Edit Scheme...**
   - Check **Archive > Pre-actions** for staging scheme
   - Should copy `.env.staging` to `.env`

### Build Configuration Not Found

If you get an error about "StagingRelease" configuration:

1. **Verify configuration exists:**
   - Open Xcode project
   - Select project in navigator
   - Go to **Info** tab
   - Under **Configurations**, verify "StagingRelease" exists

2. **Re-add if missing:**
   - Duplicate "Release" configuration
   - Name it "StagingRelease"
   - Set `INFOPLIST_KEY_CFBundleDisplayName = "PayAiro Staging"` in Build Settings

## Quick Reference

| Environment | Scheme | Configuration | App Name | npm Script |
|------------|--------|---------------|----------|------------|
| Staging Debug | payAiro staging | Debug | PayAiro Staging | `npm run ios:staging:debug` |
| Staging Release | payAiro staging | StagingRelease | PayAiro Staging | `npm run ios:staging:release` |
| Production Debug | payAiro | Debug | PayAiro | `npm run ios:production:debug` |
| Production Release | payAiro | Release | PayAiro | `npm run ios:production:release` |

## Notes

- Always use the **"payAiro staging"** scheme for staging builds to get "PayAiro Staging" app name
- The **StagingRelease** configuration is specifically for staging release builds
- Debug builds use the Debug configuration but can still show different app names based on scheme
- For TestFlight/App Store, use Production Release builds with "payAiro" scheme

