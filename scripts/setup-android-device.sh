#!/bin/bash

# Script to set up ADB reverse port forwarding for physical Android devices
# This allows the device to connect to Metro bundler running on your computer

echo "🔧 Setting up Android device connection..."

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "❌ Error: ADB is not installed or not in PATH"
    echo "   Please install Android SDK Platform Tools"
    echo "   On macOS: brew install android-platform-tools"
    exit 1
fi

# Wait a moment for ADB to detect devices
sleep 1

# Check if any devices are connected
DEVICES=$(adb devices | grep -v "List" | grep -E "device$|unauthorized" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq 0 ]; then
    echo "⚠️  No Android devices found"
    echo ""
    echo "📋 Troubleshooting steps:"
    echo "   1. Connect your device via USB"
    echo "   2. Enable 'Developer Options' on your device"
    echo "   3. Enable 'USB Debugging' in Developer Options"
    echo "   4. Accept the USB debugging authorization prompt on your device"
    echo "   5. Run: adb devices (to verify connection)"
    echo ""
    echo "💡 If device shows as 'unauthorized', check your device for authorization prompt"
    exit 1
fi

# Check for unauthorized devices
UNAUTHORIZED_COUNT=$(adb devices | grep -c "unauthorized" || echo "0")
if [ "$UNAUTHORIZED_COUNT" -gt 0 ]; then
    echo "⚠️  Found unauthorized device(s)"
    echo "   Please accept the USB debugging authorization on your device"
    exit 1
fi

# Get list of connected device serials
DEVICE_SERIALS=$(adb devices | grep -E "device$" | awk '{print $1}')

if [ -z "$DEVICE_SERIALS" ]; then
    echo "❌ No authorized devices found"
    exit 1
fi

# Count connected devices
CONNECTED_COUNT=$(echo "$DEVICE_SERIALS" | wc -l | tr -d ' ')
echo "✅ Found $CONNECTED_COUNT connected device(s)"

# Set up port forwarding for each device
echo "📱 Setting up port forwarding (8081 -> 8081) for all devices..."
SUCCESS_COUNT=0
FAILED_DEVICES=""

while IFS= read -r device_serial; do
    if [ -n "$device_serial" ]; then
        echo "   Setting up for device: $device_serial"
        # Remove existing port forwarding (if any) to avoid conflicts
        adb -s "$device_serial" reverse --remove tcp:8081 2>/dev/null || true
        
        if adb -s "$device_serial" reverse tcp:8081 tcp:8081; then
            echo "   ✅ Port forwarding configured for $device_serial"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo "   ❌ Failed to set up port forwarding for $device_serial"
            FAILED_DEVICES="$FAILED_DEVICES $device_serial"
        fi
    fi
done <<< "$DEVICE_SERIALS"

echo ""
if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "✅ Port forwarding configured successfully for $SUCCESS_COUNT device(s)"
    echo ""
    echo "💡 Your device(s) can now connect to Metro bundler"
    echo "   Make sure Metro is running with: npm start"
    echo ""
    echo "📋 To verify port forwarding: adb reverse --list"
    if [ -n "$FAILED_DEVICES" ]; then
        echo ""
        echo "⚠️  Some devices failed: $FAILED_DEVICES"
        echo "   You can try manually: adb -s <device-serial> reverse tcp:8081 tcp:8081"
    fi
else
    echo "❌ Failed to set up port forwarding for all devices"
    echo "   Try running manually: adb -s <device-serial> reverse tcp:8081 tcp:8081"
    exit 1
fi

