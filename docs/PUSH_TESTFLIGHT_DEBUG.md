# Push notifications: Debug vs TestFlight (iOS)

## Why Xcode can't help for TestFlight

- **Debug build** (run from Xcode): The app is attached to Xcode, so you see `NSLog` and console output.
- **TestFlight build**: The app runs on the device **without** Xcode. There is no console attachment, so you cannot see native logs.

So we don't rely on Xcode for TestFlight. We use **in-app visibility** instead.

---

## How to debug push on TestFlight

1. Install the app from TestFlight.
2. On the **landing screen** (before login), tap **"Debug / Test (FCM token & device info)"**.
3. Check:
   - **Build mode**: should show `false (release)`.
   - **Notification permission**: should show `granted` or `provisional`.
   - **FCM Token**: if it shows a long string, the app got a token. If it shows **"—"**, the token was not obtained in release.
   - **APNs Token (iOS)**: if it shows **"Not set"**, iOS did not give the app an APNs device token (this is the usual cause of "works in debug, fails in TestFlight").

What you see here is the **runtime evidence** we need:

- **FCM token "—" or APNs "Not set" on TestFlight** → Fix is in **Firebase Console** and/or **Apple provisioning** (see below).
- **FCM token present but notifications still not received** → Then the issue may be backend (token not sent to FCM) or how the message is sent (e.g. topic vs token).

---

## Why PushNotificationApp works in TestFlight but payAiro didn't

| | Debug (Xcode) | TestFlight / Release |
|--|----------------|----------------------|
| **APNs environment** | Sandbox | Production |
| **Firebase** | Uses sandbox APNs credentials | Must use **production** APNs credentials |

- **PushNotificationApp** was set up with the correct **production** APNs setup in Firebase (e.g. APNs Auth Key .p8, or both certs).
- **payAiro** is an older app; often only the **development (sandbox)** certificate was uploaded. So:
  - Debug → sandbox → works.
  - TestFlight → production → fails, because Firebase has no production APNs credentials for this app.

---

## Fix: Firebase Console (required for TestFlight)

1. Open [Firebase Console](https://console.firebase.google.com) → your **payAiro** project.
2. Go to **Project settings** (gear) → **Cloud Messaging**.
3. Under **Apple app configuration** for your iOS app (`com.app.payairo`):
   - Upload **APNs Authentication Key (.p8)** (recommended; works for both sandbox and production),  
   **or**
   - Upload **APNs Certificates**: ensure you have the **Production** certificate (not only Development).
4. Save. New FCM tokens from TestFlight builds will then be usable for delivery.

---

## Fix: Apple side (if APNs token is "Not set" on TestFlight)

- In [Apple Developer](https://developer.apple.com) → **Certificates, Identifiers & Profiles**:
  - Your App ID must have **Push Notifications** capability enabled.
  - The **distribution** provisioning profile used for TestFlight/App Store must include **Push Notifications**.
- In Xcode, the target’s **Signing & Capabilities** should show **Push Notifications** for the release configuration.

---

## Summary

- **Xcode** cannot show logs for TestFlight; use the in-app **Debug / Test** screen for evidence.
- **Push works in debug but not TestFlight** on iOS is almost always **APNs environment**: production credentials (p8 or production cert) must be set in Firebase for the payAiro iOS app.
- After adding the APNs Auth Key (or production cert) in Firebase, existing TestFlight users may need to **re-open the app** so a new FCM token is obtained and sent to your backend.
