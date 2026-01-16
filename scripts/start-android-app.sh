#!/bin/bash

# Script to start Android app on all connected devices
# Usage: ./scripts/start-android-app.sh <package-name>/<activity-name>
# Example: ./scripts/start-android-app.sh com.payairo.staging/com.payairo.MainActivity

if [ -z "$1" ]; then
    echo "❌ Error: Package/Activity name required"
    echo "   Usage: $0 <package-name>/<activity-name>"
    echo "   Example: $0 com.payairo.staging/com.payairo.MainActivity"
    exit 1
fi

PACKAGE_ACTIVITY="$1"

# Get list of connected device serials
DEVICE_SERIALS=$(adb devices | grep -E "device$" | awk '{print $1}')

if [ -z "$DEVICE_SERIALS" ]; then
    echo "❌ No authorized devices found"
    exit 1
fi

# Count connected devices
CONNECTED_COUNT=$(echo "$DEVICE_SERIALS" | wc -l | tr -d ' ')
echo "🚀 Starting app on $CONNECTED_COUNT device(s)..."
echo "   Package/Activity: $PACKAGE_ACTIVITY"
echo ""

SUCCESS_COUNT=0
FAILED_DEVICES=""

while IFS= read -r device_serial; do
    if [ -n "$device_serial" ]; then
        echo "   Starting on device: $device_serial"
        if adb -s "$device_serial" shell am start -n "$PACKAGE_ACTIVITY"; then
            echo "   ✅ App started on $device_serial"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo "   ❌ Failed to start app on $device_serial"
            FAILED_DEVICES="$FAILED_DEVICES $device_serial"
        fi
    fi
done <<< "$DEVICE_SERIALS"

echo ""
if [ $SUCCESS_COUNT -gt 0 ]; then
    echo "✅ App started successfully on $SUCCESS_COUNT device(s)"
    if [ -n "$FAILED_DEVICES" ]; then
        echo "⚠️  Some devices failed: $FAILED_DEVICES"
    fi
else
    echo "❌ Failed to start app on all devices"
    exit 1
fi
