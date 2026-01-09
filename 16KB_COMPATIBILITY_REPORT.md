# 16KB Page Size Compatibility Report

## Summary

This report identifies native libraries (`.so` files) in your AAB file that are **NOT compatible** with Android's 16KB page size requirement for apps targeting Android 15 (API 35+).

**✅ Verified from actual AAB file uploaded to Google Play Console:**
- File: `android/app/build/outputs/bundle/productionRelease/app-production-release.aab`
- Checked using `bundletool` to extract the exact APKs that Google Play delivers
- This is the **exact same file** that triggered the 16KB warning in Google Play Console

## How to Use This Report

1. **Check Google Play Console** - Compare the libraries listed here with what Google Play Console reports
2. **📋 See Update Guide** - For complete update instructions, see [`16KB_UPDATE_GUIDE.md`](./16KB_UPDATE_GUIDE.md)
3. **Update Dependencies** - Focus on updating the React Native packages listed below
4. **Rebuild** - After updating, rebuild your APK and run the check script again

## Non-Compliant Libraries by Architecture

### Critical Issues (All Architectures)
These libraries are non-compliant across **all or most architectures**:

| Library Name | React Native Package | Status |
|-------------|---------------------|--------|
| `libappmodules.so` | React Native Core (app-specific modules) | ❌ Non-compliant |
| `libfbjni.so` | React Native Core (Facebook JNI) | ❌ Non-compliant |
| `libgesturehandler.so` | `react-native-gesture-handler` | ❌ Non-compliant |
| `libhermestooling.so` | React Native Hermes | ❌ Non-compliant |
| `libimage_processing_util_jni.so` | Image processing libraries | ❌ Non-compliant |
| `libjsi.so` | React Native JSI | ❌ Non-compliant |
| `libpdfiumandroid.so` | `react-native-pdf` | ❌ Non-compliant |
| `libreact-native-mmkv.so` | `react-native-mmkv` | ❌ Non-compliant |
| `libreact_codegen_*.so` | React Native Codegen (various packages) | ❌ Non-compliant |
| `libreanimated.so` | `react-native-reanimated` | ❌ Non-compliant |
| `librnscreens.so` | `react-native-screens` | ❌ Non-compliant |
| `libworklets.so` | `react-native-reanimated` (worklets) | ❌ Non-compliant |

### Architecture-Specific Issues

#### arm64-v8a (64-bit ARM - Most Common)
- `libimagepipeline.so` - ❌ Non-compliant (but ✅ compliant in armeabi-v7a)
- `libnative-filters.so` - ❌ Non-compliant (but ✅ compliant in armeabi-v7a)
- `libnative-imagetranscoder.so` - ❌ Non-compliant (but ✅ compliant in armeabi-v7a)

#### armeabi-v7a (32-bit ARM)
- Most libraries use 4KB alignment (0x1000) - ❌ Non-compliant
- Only 3 libraries are compliant: `libimagepipeline.so`, `libnative-filters.so`, `libnative-imagetranscoder.so`

#### x86 / x86_64
- Similar issues to ARM architectures

## Library to Package Mapping

### React Native Core Libraries
- `libhermes.so` / `libhermestooling.so` → React Native Hermes Engine
- `libreactnative.so` → React Native Core
- `libjsi.so` → React Native JSI
- `libfbjni.so` → React Native Facebook JNI
- `libappmodules.so` → Your app's native modules

### Third-Party Libraries

| .so File | React Native Package | Current Version (from package.json) |
|----------|---------------------|-------------------------------------|
| `libgesturehandler.so` | `react-native-gesture-handler` | ^2.21.2 |
| `libreanimated.so` / `libworklets.so` | `react-native-reanimated` | 3.16.7 |
| `librnscreens.so` | `react-native-screens` | 4.2.0 |
| `librnskia.so` | `@shopify/react-native-skia` | ^1.7.6 |
| `libpdfium.so` / `libpdfiumandroid.so` | `react-native-pdf` | ^6.7.7 |
| `libreact-native-mmkv.so` | `react-native-mmkv` | ^3.2.0 |
| `libimage_processing_util_jni.so` | `react-native-image-picker` or `react-native-image-crop-picker` | ^8.2.1 / ^0.42.0 |
| `libimagepipeline.so` | Fresco (used by image libraries) | - |
| `libnative-filters.so` / `libnative-imagetranscoder.so` | Image processing libraries | - |
| `libucrop.so` | `react-native-image-crop-picker` | ^0.42.0 |
| `libbarhopper_v3.so` | Unknown (possibly Google Maps or location services) | - |
| `libc++_shared.so` | C++ Standard Library (used by many libraries) | - |

### Codegen Libraries (React Native New Architecture)
- `libreact_codegen_RNCSlider.so` → `@react-native-community/slider`
- `libreact_codegen_rnscreens.so` → `react-native-screens`
- `libreact_codegen_rnsvg.so` → `react-native-svg`
- `libreact_codegen_safeareacontext.so` → `react-native-safe-area-context`

## Recommended Actions

### Priority 1: Update React Native Core
1. **Update React Native** to latest version (you're on 0.77.1 - check for 0.77.x updates)
2. **Update React Native Reanimated** - Current: 3.16.7 → Check for 3.17+ or latest
3. **Update React Native Screens** - Current: 4.2.0 → Check for 4.3+ or latest

### Priority 2: Update Image Processing Libraries
1. **react-native-image-picker** - Current: ^8.2.1 → Update to latest
2. **react-native-image-crop-picker** - Current: ^0.42.0 → Update to latest
3. These likely contain `libimage_processing_util_jni.so`, `libimagepipeline.so`, `libnative-*.so`

### Priority 3: Update Other Libraries
1. **react-native-pdf** - Current: ^6.7.7 → Update to latest (fixes `libpdfiumandroid.so`)
2. **react-native-mmkv** - Current: ^3.2.0 → Update to latest
3. **react-native-gesture-handler** - Current: ^2.21.2 → Update to latest
4. **@shopify/react-native-skia** - Current: ^1.7.6 → Update to latest

### Priority 4: Check Build Configuration
1. Update Android Gradle Plugin to 8.0+ (if not already)
2. Update NDK version (you're on 28.0.12433566 - should be fine)
3. Remove `useLegacyPackaging = true` from `build.gradle` after updating libraries

## How to Check After Updates

### Check from AAB file (Recommended - matches Google Play):
```bash
./check-16kb-from-aab.sh
```

### Check from local APK:
```bash
./check-16kb-libs.sh
```

### Rebuild and check:
```bash
cd android && ./gradlew bundleProductionRelease && cd ..
./check-16kb-from-aab.sh
```

## Key Findings from AAB Analysis

### Most Critical Issues (arm64-v8a - Most Common Architecture):
1. **`libimage_processing_util_jni.so`** - Alignment: **0x4 (4 bytes)** ❌ - CRITICAL
2. **`libimagepipeline.so`** - Alignment: **0xd8 (216 bytes)** ❌
3. **`libnative-filters.so`** - Alignment: **0x90 (144 bytes)** ❌
4. **`libnative-imagetranscoder.so`** - Alignment: **0xbd8 (3032 bytes)** ❌
5. **`libgesturehandler.so`** - Alignment: **0x700 (1792 bytes)** ❌
6. **`libreanimated.so`** - Alignment: **0xe40 (3648 bytes)** ❌
7. **`libpdfiumandroid.so`** - Alignment: **0x9e0 (2528 bytes)** ❌

### Architecture-Specific Notes:
- **arm64-v8a**: 17 non-compliant, 6 compliant libraries
- **armeabi-v7a**: 22 non-compliant (mostly 4KB alignment), 3 compliant
- **x86/x86_64**: Similar pattern to ARM architectures

## Notes

- **arm64-v8a** is the most important architecture (most modern devices)
- Some libraries show different alignment across architectures
- The `libc++_shared.so` issue may be resolved by updating libraries that depend on it
- **This analysis was done on the exact AAB file uploaded to Google Play Console**
- The libraries listed here are the ones Google Play Console is flagging

## Next Steps

1. ✅ **DONE**: Identified all non-compliant libraries
2. 📋 **READ**: See [`16KB_UPDATE_GUIDE.md`](./16KB_UPDATE_GUIDE.md) for complete update instructions
3. ⏳ **TODO**: Update React Native and all dependencies to latest versions (11-12 packages)
4. ⏳ **TODO**: Rebuild AAB and verify with check script
5. ⏳ **TODO**: Upload to Google Play Console and verify no warnings

## Related Files

- **📋 [`16KB_UPDATE_GUIDE.md`](./16KB_UPDATE_GUIDE.md)** - Complete step-by-step update guide with all packages to update
- **🔍 `check-16kb-from-aab.sh`** - Script to check AAB files (matches Google Play)
- **🔍 `check-16kb-libs.sh`** - Script to check local APK files
