#!/bin/bash

# Check if Metro bundler is already running on port 8081
if lsof -ti:8081 > /dev/null 2>&1; then
  echo "✅ Metro bundler is already running"
else
  echo "🚀 Starting Metro bundler..."
  # Start Metro in background but keep it accessible
  # Use --host 0.0.0.0 to allow physical devices to connect
  npx react-native start --host 0.0.0.0 &
  METRO_PID=$!
  echo "Metro bundler started (PID: $METRO_PID)"
  # Wait a bit for Metro to initialize
  sleep 5
  
  # Set up port forwarding for physical devices
  # This allows physical devices to connect via USB
  if adb devices | grep -q "device$" && ! adb devices | grep -q "emulator"; then
    echo "📱 Setting up port forwarding for physical device..."
    adb reverse tcp:8081 tcp:8081
    echo "✅ Port forwarding configured"
  fi
  
  echo "✅ Metro bundler is ready"
  echo "💡 Metro is running. You can see it in a new terminal or check http://localhost:8081"
fi

