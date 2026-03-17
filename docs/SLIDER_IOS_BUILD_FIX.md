# react-native-slider iOS C++ Build Errors (conditional_t / op_new / op_del)

## Why these errors appear "suddenly"

The errors come from **React Native's New Architecture** (which you have enabled for Reanimated 4.x). The slider’s Fabric component uses the same C++/Folly stack as React Native. The messages:

- `No matching function for call to object of type 'const conditional_t<false, op_del_builtin_fn_, op_del_library_fn_>'`
- `No matching function for call to object of type 'const conditional_t<false, op_new_builtin_fn_, op_new_library_fn_>'`

usually mean one of these:

1. **Stale build artifacts** – Pods or Xcode build cache were built with a different React Native version, Xcode version, or C++ toolchain, so object files don’t match the current headers.
2. **Mixed compilation** – Some code (e.g. slider or codegen) was compiled with different Folly/C++ settings than the rest of the app.
3. **Cache / DerivedData** – Old iOS build or DerivedData is still in use.

So it’s not that the slider “broke” overnight; it’s that a clean, consistent build isn’t being done after a change (RN upgrade, Xcode update, or enabling New Arch).

## Fix (do in this order)

### 1. Full clean and reinstall (most likely fix)

Close **Xcode completely**, then in the project root:

```bash
cd payAiro-app/ios
rm -rf Pods Podfile.lock build
cd ..
npm install
cd ios
pod install
cd ..
```

Then reopen Xcode and build (Cmd+B).

### 2. If it still fails: clear Xcode DerivedData for this app

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/payAiro-*
```

Then in Xcode: **Product → Clean Build Folder** (Shift+Cmd+K), then build again.

### 3. If it still fails: try clearing Metro and node

From `payAiro-app`:

```bash
rm -rf node_modules
npm install
cd ios && rm -rf Pods Podfile.lock build && pod install && cd ..
```

Reopen Xcode and build.

## If you need a temporary workaround

If you must ship and can’t fix the slider build soon, you can:

- Replace `@react-native-community/slider` with a **JS-only** slider (e.g. a custom component using `PanResponder` or a library that doesn’t use Fabric C++), or  
- Temporarily **disable New Architecture** (set `ENV['RCT_NEW_ARCH_ENABLED'] = '0'` in the Podfile) and see if the app builds — only as a diagnostic; you’d need New Arch again for Reanimated 4.x.

## Summary

- The errors are from **New Architecture + Folly C++** and inconsistent or stale native build state.
- Fix: **close Xcode → delete Pods, Podfile.lock, ios/build → `npm install` → `pod install` → reopen Xcode and build.**
- If needed, clear DerivedData and/or `node_modules` and repeat.
