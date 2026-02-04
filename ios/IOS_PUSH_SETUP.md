# iOS Push Notifications Setup

Follow these steps to complete the iOS push notification setup.

## Step 1: Add iOS App in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e.g. **payairo-13cfd**)
3. Click **⚙️ Project settings** → **Your apps**
4. Click **Add app** → Select **iOS**
5. Enter **Bundle ID**: `com.app.payairo` (must match Xcode)
6. App nickname: `PayAiro` (optional)
7. Click **Register app**

## Step 2: Download GoogleService-Info.plist

1. On the next screen, click **Download GoogleService-Info.plist**
2. Save the file
3. **Add to Xcode:**
   - Open `payAiro.xcworkspace` in Xcode
   - Right-click the **payAiro** folder in the project navigator
   - Select **Add Files to "payAiro"...**
   - Select `GoogleService-Info.plist`
   - ✅ Check **Copy items if needed**
   - ✅ Check **payAiro** under "Add to targets"
   - Click **Add**

## Step 3: Apple Developer - Enable Push Notifications

1. Go to [Apple Developer](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Select your App ID (`com.app.payairo`)
4. Enable **Push Notifications** → **Save**

## Step 4: Create APNs Key

1. **Keys** → **+** (Create a key)
2. Key name: `PayAiro Push Key`
3. Enable **Apple Push Notifications service (APNs)**
4. **Continue** → **Register**
5. **Download** the `.p8` file (only downloadable once!)
6. Note the **Key ID** and your **Team ID**

## Step 5: Upload APNs Key to Firebase

1. Firebase Console → **Project settings** → **Cloud Messaging**
2. Under **Apple app configuration**, select your iOS app
3. **APNs Authentication Key** → **Upload**
4. Upload `.p8` file, enter Key ID and Team ID
5. Do for both **Development** and **Production** (same key works for both)

## Step 6: Build & Test

```bash
cd ios
pod install
cd ..
```

Then in Xcode: **Product** → **Archive** → Upload to TestFlight

---

## What's Already Configured

- ✅ `payAiro.entitlements` - aps-environment: production
- ✅ `Info.plist` - UIBackgroundModes: remote-notification, fetch
- ✅ `AppDelegate.swift` - Firebase + APNs token forwarding
