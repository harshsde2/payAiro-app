#!/bin/bash

# PayAiro App - Complete Clean Build Script
# This script cleans all build artifacts and caches

echo "🧹 Starting complete clean process..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Project root: $PROJECT_ROOT"

# 1. Clean Android build
echo "🔧 Cleaning Android build directories..."
rm -rf "$PROJECT_ROOT/android/app/build"
rm -rf "$PROJECT_ROOT/android/build"
echo "✅ Android build directories cleaned"

# 2. Clean node_modules build cache
echo "🗂️ Cleaning node_modules build cache..."
rm -rf "$PROJECT_ROOT/node_modules/.gradle"
echo "✅ node_modules build cache cleaned"

# 3. Clean Gradle cache (optional - uncomment if needed)
# echo "🗑️ Cleaning Gradle cache..."
# rm -rf ~/.gradle/caches
# echo "✅ Gradle cache cleaned"

# 4. Clean Metro cache (React Native bundler)
echo "🔄 Cleaning Metro cache..."
rm -rf "$PROJECT_ROOT/node_modules/.cache"
rm -rf "$PROJECT_ROOT/.metro-cache"
rm -rf "$PROJECT_ROOT/.watchman*"
echo "✅ Metro cache cleaned"

# 5. Optional: Clean watchman cache
echo "🎯 Clearing watchman..."
watchman watch-del-all 2>/dev/null || true
echo "✅ Watchman cleared"

# 6. Reinstall dependencies (optional - uncomment if needed)
# echo "📦 Reinstalling dependencies..."
# cd "$PROJECT_ROOT"
# npm install
# cd "$PROJECT_ROOT/android"
# ./gradlew clean
# echo "✅ Dependencies reinstalled"

echo ""
echo "✨ Clean complete!"
echo ""
echo "Next steps:"
echo "1. cd android && ./gradlew clean"
echo "2. cd .. && npm install"
echo "3. npm run android (for debug build)"
echo "4. npm run android:release (for release build)"
