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
UNAUTHORIZED=$(adb devices | grep -c "unauthorized" || echo "0")
if [ "$UNAUTHORIZED" -gt 0 ]; then
    echo "⚠️  Found unauthorized device(s)"
    echo "   Please accept the USB debugging authorization on your device"
    exit 1
fi

CONNECTED_DEVICES=$(adb devices | grep -c "device$" || echo "0")
echo "✅ Found $CONNECTED_DEVICES connected device(s)"

# Remove existing port forwarding (if any) to avoid conflicts
adb reverse --remove tcp:8081 2>/dev/null || true

# Set up port forwarding
echo "📱 Setting up port forwarding (8081 -> 8081)..."
if adb reverse tcp:8081 tcp:8081; then
    echo "✅ Port forwarding configured successfully"
    echo ""
    echo "💡 Your device can now connect to Metro bundler"
    echo "   Make sure Metro is running with: npm start"
    echo ""
    echo "📋 To verify port forwarding: adb reverse --list"
else
    echo "❌ Failed to set up port forwarding"
    echo "   Try running manually: adb reverse tcp:8081 tcp:8081"
    exit 1
fi

