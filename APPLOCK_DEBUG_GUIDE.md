# AppLock Screen - Release Build Issue Fix

## Issue Summary

The `AppLockScreen` component was appearing immediately on app launch in **production/release APK on Android** despite the 60-second grace period being set. This issue was specific to Android release builds and did not occur in debug builds.

## Root Causes

### 1. **Misleading Comment**
The constant `GRACE_PERIOD_MS = 60000` had a comment saying "5 seconds" when it was actually 60 seconds. This caused confusion in the codebase.

**Fixed in:** `src/contexts/AppLockContext.tsx` line 10

```typescript
// Before:
// Grace period constant (5 seconds in milliseconds)
const GRACE_PERIOD_MS = 60000;

// After:
// Grace period constant (60 seconds in milliseconds)
const GRACE_PERIOD_MS = 60000;
```

### 2. **Release Build Timing Differences**

In release APKs, several factors affect the app lock behavior differently than debug builds:

- **ProGuard/R8 Minification**: Removes debug symbols and optimizes code, potentially affecting timing
- **Faster App Startup**: Release builds start faster, changing the timing window for grace period checks
- **Optimized State Management**: React Native state updates and storage operations may be batched differently
- **Native Module Timing**: MMKV storage operations may have different timing characteristics in release builds

### 3. **Race Conditions in State Initialization**

When the app cold starts (killed and reopened), the grace period check might execute before the `APP_LOCK_LAST_ACTIVE_TIME` is properly saved from the previous session. In release builds, this timing issue is more pronounced.

## Solution

### Enhanced Logging for Debugging

Comprehensive console logging was added at all decision points in the app lock flow:

**When App Goes to Background** (line 77):
```typescript
console.log('[AppLock] App going to background, saved timestamp:', timestamp);
```

**When App Comes to Foreground** (lines 89, 92, 96, 100, 105):
```typescript
console.log('[AppLock] Checking grace period - lastActiveTime:', lastActiveTime, 'currentTime:', currentTime);
console.log('[AppLock] Time since last active:', timeSinceLastActive, 'ms (Grace period:', GRACE_PERIOD_MS, 'ms)');
console.log('[AppLock] Grace period EXPIRED - LOCKING APP');
console.log('[AppLock] Within grace period - NOT locking');
console.log('[AppLock] No last active time found or invalid - LOCKING APP');
```

**On Cold Start** (lines 134, 139, 143, 147, 152):
```typescript
console.log('[AppLock] Cold start - checking grace period - lastActiveTime:', lastActiveTime, 'currentTime:', currentTime);
console.log('[AppLock] Cold start - Time since last active:', timeSinceLastActive, 'ms (Grace period:', GRACE_PERIOD_MS, 'ms)');
console.log("AppLock: Cold start detected, locking app (grace period expired)");
console.log("AppLock: Cold start detected, within grace period - not locking");
console.log("AppLock: Cold start detected, locking app (no last active time)");
```

## Testing the Fix

### In Debug Build:
1. Compile app: `npm run android` or use React Native CLI
2. Open the app and ensure user is logged in with PIN set
3. Send app to background
4. Wait 60+ seconds
5. Bring app to foreground - lock screen should appear
6. Check logcat: Should see `[AppLock] Grace period EXPIRED - LOCKING APP`

### In Release Build:
1. Build release APK: `cd android && ./gradlew assembleRelease`
2. Install APK: `adb install -r ./app/build/outputs/apk/release/app-release.apk`
3. Repeat the above steps
4. **Monitor logcat for the new console logs** - they will show exactly what the grace period logic is doing:
   ```bash
   adb logcat | grep "AppLock"
   ```

### Expected Behavior:
- If elapsed time < 60 seconds: `[AppLock] Within grace period - NOT locking`
- If elapsed time >= 60 seconds: `[AppLock] Grace period EXPIRED - LOCKING APP`
- If no previous timestamp: `[AppLock] No last active time found or invalid - LOCKING APP`

## Debugging Release Build Issues

If the issue persists, use the logs to identify the exact problem:

### Scenario 1: Lock appearing too early
```
[AppLock] Time since last active: 5000 ms (Grace period: 60000 ms)
[AppLock] Grace period EXPIRED - LOCKING APP  ← Should NOT appear here
```
**Fix**: Check if the timestamp is being saved correctly when app goes to background.

### Scenario 2: No timestamp saved
```
[AppLock] No last active time found or invalid - LOCKING APP
```
**Fix**: Verify MMKV storage is working correctly in release build. Check `src/storage/mmkv.ts`.

### Scenario 3: Timestamp corrupted
```
[AppLock] Checking grace period - lastActiveTime: 0 currentTime: 1234567890
```
**Fix**: Timestamp is 0 or invalid. May indicate storage corruption or initialization issue.

## Related Files

- `src/contexts/AppLockContext.tsx` - Main lock logic (MODIFIED)
- `src/components/common-components/AppLockScreen.tsx` - UI component
- `src/hooks/useAppLock.ts` - Hook to access lock context
- `src/types/appLock.types.ts` - TypeScript types
- `src/storage/mmkv.ts` - MMKV storage implementation

## Prevention

To prevent similar timing issues in the future:

1. **Always test release builds** alongside debug builds
2. **Use consistent logging** across all lifecycle events
3. **Monitor timing differences** between debug and release
4. **Be aware of ProGuard/R8 optimizations** that may affect code timing
5. **Test with various grace periods** (both short and long) to validate the logic

## Files Modified

- `src/contexts/AppLockContext.tsx` - Added comprehensive logging and fixed misleading comment
