#!/bin/bash

# Check if an Android emulator is already running
if adb devices | grep -q "emulator"; then
  echo "✅ Android emulator is already running"
  exit 0
fi

# Check if any Android device is connected
if adb devices | grep -q "device$"; then
  echo "✅ Android device is connected"
  exit 0
fi

# Try to start an emulator
echo "📱 Starting Android emulator..."
# List available emulators
EMULATORS=$(emulator -list-avds 2>/dev/null)

if [ -z "$EMULATORS" ]; then
  echo "⚠️  No Android emulators found. Please create one in Android Studio."
  echo "   Or connect a physical device via USB."
  exit 1
fi

# Get the first available emulator
FIRST_EMULATOR=$(echo "$EMULATORS" | head -n 1)
echo "Starting emulator: $FIRST_EMULATOR"

# Start emulator in background
emulator -avd "$FIRST_EMULATOR" > /dev/null 2>&1 &

# Wait for emulator to boot (this can take a while)
echo "⏳ Waiting for emulator to boot..."
timeout=60
counter=0
while ! adb devices | grep -q "emulator.*device"; do
  sleep 2
  counter=$((counter + 2))
  if [ $counter -ge $timeout ]; then
    echo "⚠️  Emulator is taking too long to boot. Continuing anyway..."
    break
  fi
done

if adb devices | grep -q "emulator.*device"; then
  echo "✅ Android emulator is ready"
else
  echo "⚠️  Emulator may still be booting. The build will continue..."
fi





