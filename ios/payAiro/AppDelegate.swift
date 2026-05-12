import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import Firebase
import FirebaseMessaging
import UserNotifications
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /// Reads keys baked in by react-native-config (`GeneratedDotEnv.m` from `payAiro-app/.env` at compile time).
  private static func resolveGoogleMapsApiKeyFromRNC() -> String {
    let dict = RNCConfig.env() as? [String: Any] ?? [:]
    let ios = (dict["GOOGLE_MAPS_API_KEY_IOS"] as? String ?? "")
      .trimmingCharacters(in: .whitespacesAndNewlines)
    if !ios.isEmpty { return ios }
    return (dict["GOOGLE_MAPS_API_KEY"] as? String ?? "")
      .trimmingCharacters(in: .whitespacesAndNewlines)
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
      FirebaseApp.configure()
      Messaging.messaging().delegate = self
      UNUserNotificationCenter.current().delegate = self
      application.registerForRemoteNotifications()
    }

    let mapsKey = Self.resolveGoogleMapsApiKeyFromRNC()
    #if DEBUG
    if mapsKey.isEmpty {
      NSLog(
        "[AppDelegate] Google Maps iOS key missing in RNCConfig. " +
          "Add GOOGLE_MAPS_API_KEY_IOS (or GOOGLE_MAPS_API_KEY) to payAiro-app/.env, " +
          "run your Xcode scheme pre-action so .env is updated, then Product → Clean Build Folder and rebuild."
      )
    }
    #endif
    if !mapsKey.isEmpty {
      GMSServices.provideAPIKey(mapsKey)
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

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {}

  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

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
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }

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
