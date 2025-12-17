# iOS Environment Configuration Setup

This guide explains how to configure iOS schemes for different environments (staging and production).

## Overview

iOS uses Xcode schemes to manage different build configurations. Each scheme can use a different `.env` file, allowing you to easily switch between staging and production environments.

## Automatic Configuration (Recommended)

The `Podfile` has been configured to automatically use:
- `.env.staging` for Debug builds
- `.env.production` for Release builds

This means when you build in Debug mode, it will automatically use staging, and Release builds will use production.

## Manual Scheme Configuration (Optional)

If you want separate schemes for staging and production:

### Step 1: Create Staging Scheme

1. Open Xcode
2. In the menu bar: **Product > Scheme > Edit Scheme...**
3. Click **Duplicate Scheme** (bottom left)
4. Name it: `payAiro (Staging)`
5. Check the **Shared** checkbox so it's saved to version control

### Step 2: Add Pre-build Script for Staging

1. In the scheme editor, expand **Build** (left sidebar)
2. Select **Pre-actions**
3. Click the **+** button and select **New Run Script Action**
4. In the script editor, paste:

```bash
# Copy staging environment file to .env
if [ -f "${PROJECT_DIR}/../.env.staging" ]; then
    cp "${PROJECT_DIR}/../.env.staging" "${PROJECT_DIR}/../.env"
    echo "✅ Loaded .env.staging"
else
    echo "❌ Error: .env.staging not found!"
    exit 1
fi
```

5. Ensure **Provide build settings from** dropdown has `payAiro` selected (so `PROJECT_DIR` is available)

### Step 3: Configure Bundle Identifier for Staging

1. In Xcode, select the project in the navigator
2. Select the `payAiro` target
3. Go to **Build Settings** tab
4. Search for "Product Bundle Identifier"
5. For the staging scheme, you can add a new build configuration:
   - Go to **Info** tab in project settings
   - Duplicate the Debug configuration and name it "Staging"
   - Set Bundle Identifier to: `com.payairo.staging` (or keep as is)

### Step 4: Configure App Display Name

1. In **Build Settings**, search for "Product Name"
2. For staging builds, you can use `$(APP_DISPLAY_NAME)` if configured in Info.plist
   OR set it directly: `PayAiro Staging`

## Alternative: Using Build Configurations

You can also create separate build configurations instead of schemes:

1. Project Settings > Info tab
2. Under Configurations, duplicate Debug and Release
3. Name them: `StagingDebug`, `StagingRelease`, `ProductionDebug`, `ProductionRelease`
4. Update the Podfile `ENVFILES` mapping to include these configurations

## Verification

After setup, verify the configuration:

1. Build the app in Debug mode (should use `.env.staging`)
2. Check logs for: `[EnvConfig] Configuration loaded successfully`
3. Verify the API URL matches your staging environment

## Troubleshooting

### Environment file not loading
- Ensure `.env.staging` exists in the project root
- Check that the pre-build script path is correct
- Verify `PROJECT_DIR` is available in the script's build settings

### Wrong environment loaded
- Clear Xcode derived data: `Product > Clean Build Folder`
- Rebuild the project
- Verify the scheme's pre-action script is executing

### Build errors related to Config
- Run `pod install` in the `ios` directory
- Clear Metro bundler cache: `npm start -- --reset-cache`