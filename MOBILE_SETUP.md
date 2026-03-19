# Eliamap Mobile Setup Guide

This guide walks you through building and deploying Eliamap as a mobile app for iOS and Android using Capacitor.

## Prerequisites

- Node.js 18+ and npm
- Xcode (for iOS) - Mac only
- Android Studio (for Android)
- Google Play Console account ($25 one-time fee)
- Apple Developer Program account ($99/year)

## Step 1: Install Dependencies

```bash
# Install Capacitor and plugins
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install @capacitor/browser @capacitor/app @capacitor/status-bar @capacitor/splash-screen

# If you encounter permission issues, use:
sudo npm install -g @capacitor/cli
```

## Step 2: Build the Web App

```bash
npm run build
```

This creates the `dist/` folder that Capacitor will use.

## Step 3: Add Mobile Platforms

```bash
# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android
```

## Step 4: Configure Deep Linking (Important!)

Deep linking allows users to return to the app after Stripe checkout.

### For iOS:

Edit `ios/App/App/Info.plist` and add:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.eliamap.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>eliamap</string>
    </array>
  </dict>
</array>
```

### For Android:

Edit `android/app/src/main/AndroidManifest.xml` and add inside `<application>`:

```xml
<activity android:name="com.capacitorjs.plugins.app.AppPlugin$Activity"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="eliamap" android:host="app" />
  </intent-filter>
</activity>
```

Also update your Supabase Edge Function `create-checkout` to use the deep link:

```typescript
success_url: `${req.headers.get("origin")}/subscription?success=true`,
cancel_url: `${req.headers.get("origin")}/subscription?canceled=true`,
```

Replace with:

```typescript
success_url: `eliamap://app/subscription?success=true`,
cancel_url: `eliamap://app/subscription?canceled=true`,
```

## Step 5: Update Supabase Edge Function

Edit `supabase/functions/create-checkout/index.ts`:

Change the success/cancel URLs to use your web domain OR the app deep link scheme:

```typescript
// For web:
success_url: `${req.headers.get("origin")}/subscription?success=true`,
cancel_url: `${req.headers.get("origin")}/subscription?canceled=true`,

// For mobile (you'll need to handle both):
success_url: isMobile 
  ? `eliamap://app/subscription?success=true`
  : `${req.headers.get("origin")}/subscription?success=true`,
```

## Step 6: Sync and Open

```bash
# Sync web code to native projects
npx cap sync

# Open iOS in Xcode (Mac only)
npx cap open ios

# Open Android in Android Studio
npx cap open android
```

## Step 7: Configure App Icons and Splash Screens

### Generate icons:

```bash
# Install capacitor-assets (optional but recommended)
npm install -g @capacitor/assets

# Create assets directory structure:
mkdir -p assets
# Place your icon.png (1024x1024) and splash.png (2732x2732) in assets/

# Generate all sizes
npx capacitor-assets generate
```

### Or manually:

- **iOS**: Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- **Android**: Replace icons in `android/app/src/main/res/mipmap-*/`

## Step 8: Build and Test

### iOS (Mac + Xcode):

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your device/simulator
3. Press Run (⌘R)
4. Test on real device with your Apple ID

### Android:

1. Open `android/` folder in Android Studio
2. Wait for Gradle sync
3. Run on device/emulator
4. Test on real device

## Step 9: Create Production Builds

### Android:

```bash
cd android
./gradlew assembleRelease  # Creates APK
./gradlew bundleRelease    # Creates AAB (for Play Store)
```

Find outputs at:
- APK: `android/app/build/outputs/apk/release/`
- AAB: `android/app/build/outputs/bundle/release/`

### iOS:

1. In Xcode, select Product → Archive
2. Once archived, click "Distribute App"
3. Follow prompts for App Store Connect

## Step 10: Submit to App Stores

### Google Play Store:

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill out store listing (screenshots, description, etc.)
4. Upload AAB file
5. Submit for review

### Apple App Store:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill out app information
4. Upload build via Xcode or Transporter
5. Submit for review

## Important: Stripe Payment Flow

The app uses **web checkout** (Path A) which opens Stripe in a browser view. This is:
- ✅ Faster to implement
- ✅ Easier to maintain
- ⚠️ May require "Sign in with Apple" for Apple approval
- ⚠️ Must use deep linking to return to app

To upgrade to native Stripe SDK (Path B) later:
```bash
npm install @capacitor-community/stripe
```

## Troubleshooting

### Capacitor commands not found:
```bash
npm install -g @capacitor/cli
```

### Build fails on Android:
Make sure you have Android SDK installed and `ANDROID_HOME` set.

### iOS build fails:
- Make sure you're on Mac
- Xcode must be installed from App Store
- Run `sudo xcode-select --switch /Applications/Xcode.app`

### Deep links not working:
- Check the URL scheme matches in both app and Supabase function
- Test with: `npx cap run ios --livereload`

## Quick Reference Commands

```bash
# Development
npm run dev              # Web dev server
npm run build            # Build for production
npx cap sync             # Sync web code to native
npx cap copy             # Copy web assets only

# Testing
npx cap run ios          # Run on iOS device/sim
npx cap run android      # Run on Android device

# Opening IDE
npx cap open ios         # Open in Xcode
npx cap open android     # Open in Android Studio
```

## Next Steps

1. ✅ Set up developer accounts (Google Play + Apple Developer)
2. ✅ Install Capacitor locally
3. ✅ Build and test on your device
4. ✅ Configure deep linking properly
5. ✅ Submit to app stores

Need help? Check the [Capacitor docs](https://capacitorjs.com/docs) or message me on Telegram.
