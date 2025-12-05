#import "SafeAppDependencyProvider.h"

@implementation SafeAppDependencyProvider

- (NSDictionary<NSString *, id> *)thirdPartyFabricComponents {
  // Manually build the dictionary to avoid the corrupted auto-generated code
  // The auto-generated RCTThirdPartyComponentsProvider has a corrupted RNSScreen entry
  // that contains source code instead of a class name, causing NSInvalidArgumentException
  NSMutableDictionary<NSString *, id> *components = [NSMutableDictionary dictionary];
  
  // Helper macro to safely add class if it exists
  #define SAFE_ADD_CLASS(key, className) \
    do { \
      Class cls = NSClassFromString(className); \
      if (cls != nil) { \
        components[key] = cls; \
      } else { \
        NSLog(@"Warning: Class %@ not found for key %@", className, key); \
      } \
    } while(0)
  
  // Add all components, filtering out nil values
  SAFE_ADD_CLASS(@"BlurView", @"BlurView"); // @react-native-community/blur
  SAFE_ADD_CLASS(@"VibrancyView", @"VibrancyView"); // @react-native-community/blur
  SAFE_ADD_CLASS(@"RNCSlider", @"RNCSliderComponentView"); // @react-native-community/slider
  SAFE_ADD_CLASS(@"SkiaPictureView", @"SkiaPictureView"); // @shopify/react-native-skia
  SAFE_ADD_CLASS(@"LottieAnimationView", @"LottieAnimationViewComponentView"); // lottie-react-native
  SAFE_ADD_CLASS(@"CKCamera", @"CKCameraViewComponentView"); // react-native-camera-kit
  SAFE_ADD_CLASS(@"RNDatePicker", @"RNDatePicker"); // react-native-date-picker
  SAFE_ADD_CLASS(@"RNGestureHandlerButton", @"RNGestureHandlerButtonComponentView"); // react-native-gesture-handler
  SAFE_ADD_CLASS(@"RNPDFPdfView", @"RNPDFPdfView"); // react-native-pdf
  SAFE_ADD_CLASS(@"PLKEmbeddedView", @"PLKEmbeddedViewComponentView"); // react-native-plaid-link-sdk
  SAFE_ADD_CLASS(@"RNCSafeAreaProvider", @"RNCSafeAreaProviderComponentView"); // react-native-safe-area-context
  SAFE_ADD_CLASS(@"RNCSafeAreaView", @"RNCSafeAreaViewComponentView"); // react-native-safe-area-context
  SAFE_ADD_CLASS(@"RNSFullWindowOverlay", @"RNSFullWindowOverlay"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSModalScreen", @"RNSModalScreen"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreen", @"RNSScreenView"); // react-native-screens - FIXED: was corrupted in auto-generated code
  SAFE_ADD_CLASS(@"RNSScreenContainer", @"RNSScreenContainerView"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenContentWrapper", @"RNSScreenContentWrapper"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenFooter", @"RNSScreenFooter"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenNavigationContainer", @"RNSScreenNavigationContainerView"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenStack", @"RNSScreenStackView"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenStackHeaderConfig", @"RNSScreenStackHeaderConfig"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSScreenStackHeaderSubview", @"RNSScreenStackHeaderSubview"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSSearchBar", @"RNSSearchBar"); // react-native-screens
  SAFE_ADD_CLASS(@"RNSVGCircle", @"RNSVGCircle"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGClipPath", @"RNSVGClipPath"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGDefs", @"RNSVGDefs"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGEllipse", @"RNSVGEllipse"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeBlend", @"RNSVGFeBlend"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeColorMatrix", @"RNSVGFeColorMatrix"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeComposite", @"RNSVGFeComposite"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeFlood", @"RNSVGFeFlood"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeGaussianBlur", @"RNSVGFeGaussianBlur"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeMerge", @"RNSVGFeMerge"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFeOffset", @"RNSVGFeOffset"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGFilter", @"RNSVGFilter"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGForeignObject", @"RNSVGForeignObject"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGGroup", @"RNSVGGroup"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGImage", @"RNSVGImage"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGLine", @"RNSVGLine"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGLinearGradient", @"RNSVGLinearGradient"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGMarker", @"RNSVGMarker"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGMask", @"RNSVGMask"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGPath", @"RNSVGPath"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGPattern", @"RNSVGPattern"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGRadialGradient", @"RNSVGRadialGradient"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGRect", @"RNSVGRect"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGSvgView", @"RNSVGSvgView"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGSymbol", @"RNSVGSymbol"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGTSpan", @"RNSVGTSpan"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGText", @"RNSVGText"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGTextPath", @"RNSVGTextPath"); // react-native-svg
  SAFE_ADD_CLASS(@"RNSVGUse", @"RNSVGUse"); // react-native-svg
  SAFE_ADD_CLASS(@"RNCWebView", @"RNCWebView"); // react-native-webview
  
  #undef SAFE_ADD_CLASS
  
  NSLog(@"SafeAppDependencyProvider: Registered %lu third-party Fabric components", (unsigned long)components.count);
  return [components copy];
}

@end
