# Android Physical Device Setup Guide

## Problem
When using a physical Android device, the app reload feature doesn't work because the device cannot connect to the Metro bundler running on your development machine.

## Solution
This guide explains how to set up your physical Android device to connect to Metro bundler for hot reloading and debugging.

## Quick Start

### Method 1: Automatic Setup (Recommended)

The build scripts now automatically set up port forwarding. Just run:

```bash
# For staging
npm run android:staging:debug

# For production
npm run android:production:debug

# Or standard Android run
npm run android
```

The script will automatically:
1. Check if your device is connected
2. Set up ADB reverse port forwarding
3. Build and install the app

### Method 2: Manual Setup

If you need to set up manually:

1. **Start Metro bundler** (in one terminal):
   ```bash
   npm start
   ```
   This now automatically uses `--host 0.0.0.0` to allow device connections.

2. **Set up port forwarding** (in another terminal):
   ```bash
   bash scripts/setup-android-device.sh
   ```
   
   Or manually:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Build and run the app**:
   ```bash
   npm run android:staging:debug
   # or
   npm run android:production:debug
   ```

## Prerequisites

### 1. Enable Developer Options on Your Device

1. Go to **Settings** > **About phone**
2. Tap **Build number** 7 times
3. Go back to **Settings** > **Developer options**
4. Enable **USB debugging**

### 2. Connect Your Device

1. Connect your device via USB
2. On your device, accept the **USB debugging authorization** prompt
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed as "device" (not "unauthorized")

### 3. Verify Port Forwarding

After setup, verify port forwarding is active:
```bash
adb reverse --list
```

You should see:
```
(tcp)8081 (tcp)8081
```

## Troubleshooting

### Issue: "No Android devices found"

**Solutions:**
1. Check USB connection - try a different USB cable or port
2. Verify USB debugging is enabled on device
3. Check if device shows authorization prompt - accept it
4. Restart ADB server:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Issue: Device shows as "unauthorized"

**Solutions:**
1. Check your device for USB debugging authorization prompt
2. Revoke USB debugging authorizations on device (Settings > Developer options)
3. Disconnect and reconnect USB cable
4. Accept the new authorization prompt

### Issue: "Failed to set up port forwarding"

**Solutions:**
1. Check if port 8081 is already in use:
   ```bash
   lsof -i :8081
   ```
2. Remove existing port forwarding:
   ```bash
   adb reverse --remove tcp:8081
   ```
3. Try setting it up again:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

### Issue: App still can't reload

**Solutions:**
1. **Verify Metro is running with correct host:**
   ```bash
   npm start
   ```
   Should show: `Metro waiting on 0.0.0.0:8081`

2. **Check port forwarding is active:**
   ```bash
   adb reverse --list
   ```

3. **Restart everything:**
   ```bash
   # Kill Metro
   # Press Ctrl+C in Metro terminal
   
   # Remove port forwarding
   adb reverse --remove tcp:8081
   
   # Restart Metro
   npm start
   
   # Set up port forwarding again
   adb reverse tcp:8081 tcp:8081
   ```

4. **Shake device and select "Reload"** from the developer menu

5. **If still not working, try using your computer's IP address:**
   - Find your computer's IP address:
     ```bash
     # macOS/Linux
     ifconfig | grep "inet " | grep -v 127.0.0.1
     
     # Or
     ipconfig getifaddr en0  # macOS
     ```
   - Make sure device and computer are on the same WiFi network
   - In the app, shake device > Dev Settings > Debug server host & port
   - Enter: `YOUR_IP:8081` (e.g., `192.168.1.100:8081`)

## Alternative: WiFi Debugging (Android 11+)

For wireless debugging without USB:

1. **Enable WiFi debugging on device:**
   - Settings > Developer options > Wireless debugging
   - Enable it and note the IP address and port

2. **Connect via ADB:**
   ```bash
   adb connect DEVICE_IP:PORT
   ```

3. **Set up port forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

## What Changed

### Updated Scripts

1. **`npm start`** - Now includes `--host 0.0.0.0` flag
2. **`npm run android`** - Automatically sets up port forwarding
3. **`npm run android:staging:debug`** - Automatically sets up port forwarding
4. **`npm run android:production:debug`** - Automatically sets up port forwarding

### New Scripts

- **`scripts/setup-android-device.sh`** - Helper script to set up ADB reverse port forwarding
- **`npm run start:device`** - Start Metro with automatic port forwarding setup

## Verification Checklist

- [ ] Device connected via USB
- [ ] USB debugging enabled
- [ ] Authorization accepted on device
- [ ] `adb devices` shows device as "device"
- [ ] Metro bundler running (`npm start`)
- [ ] Port forwarding active (`adb reverse --list`)
- [ ] App installed and running on device
- [ ] Shake device > Reload works

## Additional Resources

- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [ADB Documentation](https://developer.android.com/studio/command-line/adb)
- [Metro Bundler Configuration](https://reactnative.dev/docs/metro)

