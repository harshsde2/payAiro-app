import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseMessaging
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // Configure Firebase only when GoogleService-Info.plist is present
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
      FirebaseApp.configure()
      Messaging.messaging().delegate = self
      UNUserNotificationCenter.current().delegate = self
      application.registerForRemoteNotifications()
    }
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    window = UIWindow(frame: UIScreen.main.bounds)
    
    factory.startReactNative(
      withModuleName: "PayAiro",
      in: window,
      launchOptions: launchOptions
    )
    
    return true
  }
  
  // // MARK: - APNs Token (required for FCM on iOS / TestFlight / Production)
  // func application(
  //   _ application: UIApplication,
  //   didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  // ) {
  //   Messaging.messaging().apnsToken = deviceToken
  // }
  
  // func application(
  //   _ application: UIApplication,
  //   didFailToRegisterForRemoteNotificationsWithError error: Error
  // ) {
  //   #if DEBUG
  //   print("[AppDelegate] Push registration failed: \(error.localizedDescription)")
  //   #endif
  // }
  
  // // MARK: - Firebase Messaging Delegate (FCM token for React Native)
  // func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
  //   let dataDict: [String: String] = ["token": fcmToken ?? ""]
  //   NotificationCenter.default.post(
  //     name: Notification.Name("FCMToken"),
  //     object: nil,
  //     userInfo: dataDict
  //   )
  // }
  
  // // MARK: - UNUserNotificationCenter Delegate (foreground display + tap)
  // func userNotificationCenter(
  //   _ center: UNUserNotificationCenter,
  //   willPresent notification: UNNotification,
  //   withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  // ) {
  //   if #available(iOS 14.0, *) {
  //     completionHandler([[.banner, .sound, .badge]])
  //   } else {
  //     completionHandler([[.alert, .sound, .badge]])
  //   }
  // }
  
  // func userNotificationCenter(
  //   _ center: UNUserNotificationCenter,
  //   didReceive response: UNNotificationResponse,
  //   withCompletionHandler completionHandler: @escaping () -> Void
  // ) {
  //   completionHandler()
  // }
  
  // MARK: - Deep Linking (Custom URL Scheme: payairo://)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
  
  // MARK: - Universal Links (https://payairo.com/*)
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  
  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
