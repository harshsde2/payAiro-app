# 16KB Page Size - Complete Update Guide

## Overview

This guide provides a complete list of all packages that need to be updated to fix the 16KB page size compatibility issue. The analysis was done on the actual AAB file uploaded to Google Play Console.

**File Analyzed:** `android/app/build/outputs/bundle/productionRelease/app-production-release.aab`

---

## Complete List of Packages to Update

### Priority 1: React Native Core (CRITICAL)
**Fixes multiple core libraries**

| Package | Current Version | Update To | Libraries Fixed |
|---------|----------------|-----------|-----------------|
| `react-native` | 0.77.1 | Latest 0.77.x or 0.78.x | `libhermes.so`, `libhermestooling.so`, `libjsi.so`, `libfbjni.so`, `libreactnative.so`, `libappmodules.so` |

**Why Critical:** React Native core libraries are the foundation. Updating this may require updating related packages.

---

### Priority 2: Critical Libraries (MOST PROBLEMATIC)

These libraries have the worst alignment issues and must be updated first.

#### 1. Image Processing Libraries
| Package | Current Version | Update To | Libraries Fixed | Alignment Issue |
|---------|----------------|-----------|-----------------|----------------|
| `react-native-image-picker` | ^8.2.1 | Latest | `libimage_processing_util_jni.so` | **0x4 (4 bytes)** - WORST |
| `react-native-image-crop-picker` | ^0.42.0 | Latest | `libimagepipeline.so`, `libnative-filters.so`, `libnative-imagetranscoder.so`, `libucrop.so` | 0xd8, 0x90, 0xbd8, varies |

**Why Critical:** `libimage_processing_util_jni.so` has only 4 bytes alignment - the worst case in your app.

#### 2. Animation & Gesture Libraries
| Package | Current Version | Update To | Libraries Fixed | Alignment Issue |
|---------|----------------|-----------|-----------------|----------------|
| `react-native-reanimated` | 3.16.7 | Latest 3.17+ | `libreanimated.so`, `libworklets.so` | 0xe40 (3648 bytes), 0x958 (2392 bytes) |
| `react-native-gesture-handler` | ^2.21.2 | Latest | `libgesturehandler.so` | 0x700 (1792 bytes) |

#### 3. Screen & Navigation Libraries
| Package | Current Version | Update To | Libraries Fixed | Alignment Issue |
|---------|----------------|-----------|-----------------|----------------|
| `react-native-screens` | 4.2.0 | Latest 4.3+ | `librnscreens.so`, `libreact_codegen_rnscreens.so` | 0x9a0 (2464 bytes), 0x940 (2368 bytes) |

#### 4. PDF & Storage Libraries
| Package | Current Version | Update To | Libraries Fixed | Alignment Issue |
|---------|----------------|-----------|-----------------|----------------|
| `react-native-pdf` | ^6.7.7 | Latest | `libpdfiumandroid.so`, `libpdfium.so` | 0x9e0 (2528 bytes), varies |
| `react-native-mmkv` | ^3.2.0 | Latest | `libreact-native-mmkv.so` | 0xa18 (2584 bytes) |

---

### Priority 3: Codegen Libraries (New Architecture)

These are generated libraries from React Native's New Architecture. Updating the source packages will regenerate compliant versions.

| Package | Current Version | Update To | Libraries Fixed | Alignment Issue |
|---------|----------------|-----------|-----------------|----------------|
| `@react-native-community/slider` | ^4.5.6 | Latest | `libreact_codegen_RNCSlider.so` | 0x8a8 (2216 bytes) |
| `react-native-svg` | ^15.11.1 | Latest | `libreact_codegen_rnsvg.so` | 0x910 (2320 bytes) |
| `react-native-safe-area-context` | ^5.0.0 | Latest | `libreact_codegen_safeareacontext.so` | 0x898 (2200 bytes) |

---

### Priority 4: Other Libraries

| Package | Current Version | Update To | Libraries Fixed | Notes |
|---------|----------------|-----------|-----------------|-------|
| `@shopify/react-native-skia` | ^1.7.6 | Latest | `librnskia.so` | Already compliant in arm64-v8a, but update for consistency |

---

### Priority 5: Dependencies (May Auto-Update)

| Library | Status | Notes |
|---------|--------|-------|
| `libc++_shared.so` | Will fix automatically | Usually fixed when other libraries update |
| `libbarhopper_v3.so` | Unknown source | Possibly Google Maps/location services - check if you use any |

---

## Summary Statistics

### Total Packages to Update: **11-12 packages**

**By Priority:**
- **Priority 1:** 1 package (React Native Core)
- **Priority 2:** 7 packages (Critical libraries)
- **Priority 3:** 3 packages (Codegen libraries)
- **Priority 4:** 1 package (Other)

### Libraries Fixed by Architecture

**arm64-v8a (Most Important - Modern Devices):**
- 17 non-compliant libraries will be fixed
- 6 libraries already compliant

**armeabi-v7a (32-bit ARM):**
- 22 non-compliant libraries will be fixed
- 3 libraries already compliant

**x86/x86_64:**
- Similar pattern to ARM architectures

---

## Step-by-Step Update Instructions

### Step 1: Check Current Versions
```bash
npm list react-native react-native-image-picker react-native-image-crop-picker \
  react-native-reanimated react-native-gesture-handler react-native-screens \
  react-native-pdf react-native-mmkv @react-native-community/slider \
  react-native-svg react-native-safe-area-context @shopify/react-native-skia
```

### Step 2: Update All Packages (Recommended)
```bash
# Update all packages at once
npm update react-native react-native-image-picker react-native-image-crop-picker \
  react-native-reanimated react-native-gesture-handler react-native-screens \
  react-native-pdf react-native-mmkv @react-native-community/slider \
  react-native-svg react-native-safe-area-context @shopify/react-native-skia
```

**OR** update individually by priority:

```bash
# Priority 1: React Native Core
npm update react-native

# Priority 2: Critical Libraries
npm update react-native-image-picker react-native-image-crop-picker
npm update react-native-reanimated react-native-gesture-handler
npm update react-native-screens react-native-pdf react-native-mmkv

# Priority 3: Codegen Libraries
npm update @react-native-community/slider react-native-svg react-native-safe-area-context

# Priority 4: Other
npm update @shopify/react-native-skia
```

### Step 3: Update iOS Dependencies (if applicable)
```bash
cd ios && pod install && cd ..
```

### Step 4: Clean Android Build
```bash
cd android && ./gradlew clean && cd ..
```

### Step 5: Rebuild AAB
```bash
cd android && ./gradlew bundleProductionRelease && cd ..
```

### Step 6: Verify 16KB Compliance
```bash
./check-16kb-from-aab.sh
```

### Step 7: Check Results
Look for:
- ✅ All libraries should show 16KB compatible (alignment >= 16384 bytes)
- ❌ If any libraries still show non-compliant, check if newer versions are available

---

## Alternative: Update All Dependencies

If you want to update everything at once:

```bash
# Update all dependencies
npm update

# Or use npm-check-updates for major version updates
npx npm-check-updates -u
npm install
```

**⚠️ Warning:** This may update packages beyond what's needed. Test thoroughly after updating.

---

## Post-Update Checklist

After updating, verify:

- [ ] All packages updated successfully
- [ ] iOS pods installed (if applicable)
- [ ] Android build completes without errors
- [ ] AAB file generated successfully
- [ ] 16KB check script shows all libraries compliant
- [ ] App runs correctly on test devices
- [ ] No runtime errors in logs

---

## Troubleshooting

### Issue: Build fails after updating React Native
**Solution:** Check React Native upgrade helper: https://react-native-community.github.io/upgrade-helper/
- May need to update `android/build.gradle`
- May need to update `android/gradle.properties`
- May need to update Gradle wrapper

### Issue: Some libraries still non-compliant after update
**Solution:**
1. Check if newer versions are available: `npm view <package-name> versions`
2. Check package GitHub issues for 16KB support
3. Some libraries may need to be rebuilt with newer NDK

### Issue: iOS build fails
**Solution:**
1. Clean pods: `cd ios && rm -rf Pods Podfile.lock && pod install && cd ..`
2. Clean Xcode build folder: Product > Clean Build Folder

### Issue: Android build fails
**Solution:**
1. Clean build: `cd android && ./gradlew clean && cd ..`
2. Invalidate caches in Android Studio
3. Check `android/gradle.properties` for compatibility

---

## Verification Commands

### Check package versions
```bash
npm list | grep -E "(react-native|image-picker|image-crop|reanimated|gesture-handler|screens|pdf|mmkv|slider|svg|safe-area|skia)"
```

### Check 16KB compliance
```bash
# From AAB (recommended)
./check-16kb-from-aab.sh

# From APK
./check-16kb-libs.sh
```

### Count non-compliant libraries
```bash
./check-16kb-from-aab.sh 2>&1 | grep "❌" | wc -l
```

---

## Expected Results After Update

### Before Update:
- **arm64-v8a:** 17 non-compliant, 6 compliant
- **armeabi-v7a:** 22 non-compliant, 3 compliant
- **x86/x86_64:** Similar issues

### After Update (Target):
- **arm64-v8a:** 0 non-compliant, all compliant ✅
- **armeabi-v7a:** 0 non-compliant, all compliant ✅
- **x86/x86_64:** 0 non-compliant, all compliant ✅

---

## Notes

1. **React Native Core Update:** Updating React Native may require updating related packages. Check the React Native upgrade helper for compatibility.

2. **New Architecture:** If you're using React Native's New Architecture (`newArchEnabled=true`), codegen libraries will be regenerated with proper alignment.

3. **Build Tools:** Ensure you're using:
   - Android Gradle Plugin 8.0+
   - NDK 28.0.12433566 (you already have this)
   - Latest build tools

4. **Testing:** After updating, thoroughly test your app to ensure no breaking changes.

5. **Google Play Console:** After updating and rebuilding, upload the new AAB to Google Play Console and verify no 16KB warnings appear.

---

## Quick Reference: Update Command

```bash
# One command to update all critical packages
npm update react-native react-native-image-picker react-native-image-crop-picker \
  react-native-reanimated react-native-gesture-handler react-native-screens \
  react-native-pdf react-native-mmkv @react-native-community/slider \
  react-native-svg react-native-safe-area-context @shopify/react-native-skia && \
cd ios && pod install && cd .. && \
cd android && ./gradlew clean bundleProductionRelease && cd .. && \
./check-16kb-from-aab.sh
```

---

## Support

If you encounter issues:
1. Check package GitHub repositories for 16KB support status
2. Check React Native community forums
3. Verify NDK and build tools versions
4. Check Google Play Console for specific library warnings

---

**Last Updated:** Based on analysis of AAB file from Google Play Console
**Analysis Date:** January 2025
