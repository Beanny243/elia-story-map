#!/bin/bash
# Eliamap Android Build Script
# Run this on your local machine

echo "🚀 Eliamap Android Builder"
echo "=========================="

# 1. Update code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Clean install
echo "🧹 Cleaning dependencies..."
rm -rf node_modules package-lock.json
npm install

# 3. Build web app
echo "🔨 Building web app..."
npm run build

# 4. Add Android if not exists
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
fi

# 5. Sync
echo "🔄 Syncing with Capacitor..."
npx cap sync

# 6. Build debug APK
echo "📦 Building debug APK..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ Build complete!"
echo "📍 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Install on your phone:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
