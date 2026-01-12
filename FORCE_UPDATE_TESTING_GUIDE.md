# Force Update Testing Guide

## Quick Test Setup

### Step 1: Enable Test Mode

Add these variables to your `.env.development` or `.env.staging` file:

```bash
# Enable version test mode (development only)
ENABLE_VERSION_TEST_MODE=true

# Set a test version higher than current (current is 2.8.4)
TEST_VERSION_OVERRIDE=2.9.0

# Set to true for force update, false for optional update
TEST_FORCE_UPDATE=true
```

### Step 2: Restart Metro Bundler

```bash
# Stop current Metro (Ctrl+C)
# Then restart with cache clear
npm start -- --reset-cache
```

### Step 3: Rebuild the App

**For Android:**
```bash
npm run android:staging:debug
# or
npm run android:production:debug
```

**For iOS:**
```bash
npm run ios:staging:debug
# or
npm run ios:production:debug
```

### Step 4: Check the App

1. **App should launch normally**
2. **After a few seconds**, the Force Update Modal should appear
3. **Modal should show:**
   - Alert icon
   - "Update Required" title
   - Message with version 2.9.0
   - "Update Now" button

## Testing Different Scenarios

### Scenario 1: Force Update (Non-dismissible)

**Setup:**
```bash
ENABLE_VERSION_TEST_MODE=true
TEST_VERSION_OVERRIDE=2.9.0
TEST_FORCE_UPDATE=true
```

**Expected Behavior:**
- Modal appears immediately
- Modal cannot be dismissed (no close button, tapping outside does nothing)
- Only "Update Now" button works
- Clicking "Update Now" will:
  - Android: Try to open Play Store (or show in-app update if published)
  - iOS: Open App Store

### Scenario 2: Optional Update (Dismissible)

**Setup:**
```bash
ENABLE_VERSION_TEST_MODE=true
TEST_VERSION_OVERRIDE=2.9.0
TEST_FORCE_UPDATE=false
```

**Expected Behavior:**
- Modal appears
- Can be dismissed (though current implementation doesn't have close button - you can add one)
- User can continue using app

### Scenario 3: No Update Needed

**Setup:**
```bash
ENABLE_VERSION_TEST_MODE=true
TEST_VERSION_OVERRIDE=2.8.0  # Lower than current (2.8.4)
TEST_FORCE_UPDATE=false
```

**Expected Behavior:**
- No modal appears
- App works normally

### Scenario 4: Same Version

**Setup:**
```bash
ENABLE_VERSION_TEST_MODE=true
TEST_VERSION_OVERRIDE=2.8.4  # Same as current
TEST_FORCE_UPDATE=false
```

**Expected Behavior:**
- No modal appears
- App works normally

## Testing Real Store Checks (Production Mode)

### Disable Test Mode

```bash
ENABLE_VERSION_TEST_MODE=false
# Remove or comment out TEST_VERSION_OVERRIDE and TEST_FORCE_UPDATE
```

### For Android (Internal Testing Track)

1. Upload your APK/AAB to Google Play Console → Internal Testing
2. Wait for it to be available (usually 1-2 hours)
3. Install the app from Internal Testing track
4. The app will check Play Store automatically
5. If a newer version is available, modal will appear

### For iOS (TestFlight)

1. Upload build to App Store Connect → TestFlight
2. Wait for processing (usually 30 mins - 2 hours)
3. Install via TestFlight
4. App will check App Store
5. If newer version available, clicking "Update Now" will open App Store

## Debugging & Console Logs

### Check Console Output

When test mode is enabled, you should see logs like:

```
[AppVersionService] Test mode check: {
  currentVersion: "2.8.4",
  testVersion: "2.9.0",
  shouldUpdate: true,
  forceUpdate: true
}
```

### Check if Test Mode is Active

Add this temporary log in `App.js` after the hook:

```javascript
console.log('Version Check:', {
  shouldUpdate,
  storeVersion,
  needsForceUpdate,
  testMode: EnvConfig.ENABLE_VERSION_TEST_MODE
});
```

## Common Issues & Solutions

### Issue 1: Modal doesn't appear

**Check:**
1. Is `ENABLE_VERSION_TEST_MODE=true` in your .env file?
2. Did you restart Metro bundler?
3. Did you rebuild the app?
4. Check console for errors

**Solution:**
- Verify .env file is in root directory
- Make sure you're using the correct .env file (staging vs production)
- Check console logs for version check results

### Issue 2: Modal appears but "Update Now" doesn't work

**Check:**
- In test mode, it will try to open store but may fail if app isn't published
- This is expected behavior in test mode

**Solution:**
- Test with Internal Testing/TestFlight for real store behavior
- Or check console for errors

### Issue 3: Version comparison not working

**Check:**
- Current version in `android/app/build.gradle` (versionName)
- Test version in .env file
- Console logs showing comparison

**Solution:**
- Ensure version format is correct (e.g., "2.8.4" not "2.8" or "v2.8.4")
- Check console logs for actual values

## Quick Test Checklist

- [ ] Added test mode variables to .env file
- [ ] Restarted Metro bundler
- [ ] Rebuilt app
- [ ] Modal appears on app launch
- [ ] Modal shows correct version
- [ ] "Update Now" button works
- [ ] Tested force update (non-dismissible)
- [ ] Tested optional update (dismissible)
- [ ] Tested no update scenario
- [ ] Checked console logs

## Production Testing

Once ready for production:

1. **Remove test mode variables** from production .env
2. **Deploy to stores**
3. **Test with Internal Testing/TestFlight first**
4. **Then release to production**

The app will automatically check stores and prompt users when updates are available!
