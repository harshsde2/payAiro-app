import React, { useRef, useState } from "react";
import { Platform, View, ActivityIndicator, TouchableOpacity, Linking, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import WebView from "react-native-webview";
import { Card, CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useTheme } from "styles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError } from "utils/toast";

interface RouteParams {
  checkoutLink: string;
}

const CoinflowCheckoutWebView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const webviewRef = useRef<WebView>(null);
  const globalStyles = useGlobalStyles();
  const { theme } = useTheme();
  const { checkoutLink } = (route.params as RouteParams) || {};

  // console.log("checkoutLink ->", checkoutLink);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = React.useRef(0);
  const maxRetries = 2;

  // Timeout handler - if page doesn't load in 60 seconds (longer for iOS), show error
  React.useEffect(() => {
    const timeoutDuration = Platform.OS === "ios" ? 60000 : 30000; // iOS gets 60 seconds
    const timeout = setTimeout(() => {
      if (isLoading && retryCountRef.current < maxRetries) {
        console.warn(`WebView loading timeout after ${timeoutDuration / 1000} seconds, retrying...`);
        retryCountRef.current += 1;
        if (webviewRef.current) {
          webviewRef.current.reload();
        }
      } else if (isLoading) {
        console.warn("WebView loading timeout after all retries");
        setIsLoading(false);
        setHasError(true);
        showError("The checkout page is taking too long to load. Please check your connection and try again.");
      }
    }, timeoutDuration);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // JavaScript to inject into WebView to detect success page
  const injectedJavaScript = `
    (function() {
      // Function to check for success indicators
      function checkForSuccess() {
        const bodyText = document.body.innerText || document.body.textContent || '';
        const pageTitle = document.title || '';
        const url = window.location.href || '';
        
        // Check for "Purchase Complete" text or similar success indicators
        if (bodyText.includes('Purchase Complete') || 
            bodyText.includes('purchase complete') ||
            bodyText.includes('Purchase complete') ||
            pageTitle.includes('Complete') ||
            url.includes('success') ||
            url.includes('complete')) {
          window.ReactNativeWebView.postMessage('PAYMENT_SUCCESS');
          return true;
        }
        return false;
      }
      
      // Check immediately
      checkForSuccess();
      
      // Set up observer for DOM changes
      const observer = new MutationObserver(() => {
        if (checkForSuccess()) {
          observer.disconnect();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Also listen for navigation changes
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(checkForSuccess, 1000);
        }
      }).observe(document, { subtree: true, childList: true });
      
      true; // Required for injected JavaScript
    })();
  `;

  const handleMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === "PAYMENT_SUCCESS") {
      // Show success page for 2 seconds before redirecting to dashboard
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.popToTop();
        } else {
          navigation.goBack();
        }
      }, 2000);
    }
  };

  const handleLoadEnd = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("WebView load ended: ", nativeEvent.url);
    setIsLoading(false);
    setHasError(false);
    retryCountRef.current = 0; // Reset retry count on successful load
  };

  const handleLoadStart = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("WebView load started: ", nativeEvent.url);
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadProgress = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("WebView load progress: ", Math.round(nativeEvent.progress * 100) + "%");
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error: ", JSON.stringify(nativeEvent, null, 2));
    
    // iOS network errors that should be retried: -1001 (timeout), -1005 (connection lost)
    const retryableErrors = [-1001, -1005];
    const shouldRetry = Platform.OS === "ios" && 
                       retryableErrors.includes(nativeEvent?.code) && 
                       retryCountRef.current < maxRetries;
    
    if (shouldRetry) {
      const errorNames: Record<number, string> = {
        [-1001]: "timeout",
        [-1005]: "connection lost"
      };
      const errorName = errorNames[nativeEvent?.code] || "network";
      console.log(`iOS ${errorName} error detected (attempt ${retryCountRef.current + 1}/${maxRetries}), attempting automatic reload...`);
      retryCountRef.current += 1;
      // Wait a bit then reload
      setTimeout(() => {
        if (webviewRef.current) {
          console.log("Reloading WebView after network error...");
          webviewRef.current.reload();
          setIsLoading(true);
          setHasError(false);
          return;
        }
      }, 3000); // 3 second delay before retry
      return; // Exit early, don't set error state yet
    }
    
    setIsLoading(false);
    setHasError(true);
    const errorMessage = nativeEvent?.description || nativeEvent?.message || "Unknown error";
    console.error("Error details:", {
      code: nativeEvent?.code,
      domain: nativeEvent?.domain,
      description: nativeEvent?.description,
      url: nativeEvent?.url,
      retryCount: retryCountRef.current,
    });
    
    // Show error with option to open in external browser
    if (retryCountRef.current >= maxRetries && checkoutLink) {
      Alert.alert(
        "Failed to Load Checkout",
        "Unable to load the checkout page in the app. Would you like to open it in Safari instead?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              showError(`Failed to load checkout page: ${errorMessage}`);
            }
          },
          {
            text: "Open in Safari",
            onPress: async () => {
              try {
                const canOpen = await Linking.canOpenURL(checkoutLink);
                if (canOpen) {
                  await Linking.openURL(checkoutLink);
                  // Navigate back after opening in browser
                  setTimeout(() => {
                    navigation.goBack();
                  }, 500);
                } else {
                  showError("Unable to open link in browser");
                }
              } catch (error) {
                console.error("Error opening URL:", error);
                showError("Unable to open link in browser");
              }
            }
          }
        ]
      );
    } else if (retryCountRef.current >= maxRetries) {
      showError(`Failed to load checkout page: ${errorMessage}`);
    }
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView HTTP error: ", JSON.stringify(nativeEvent, null, 2));
    setIsLoading(false);
    showError(`HTTP Error ${nativeEvent?.statusCode || "Unknown"}: ${nativeEvent?.description || "Failed to load page"}`);
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    console.log("WebView navigation request: ", request.url);
    // Allow all navigation
    return true;
  };

  const handleNavigationStateChange = (navState: any) => {
    console.log("WebView navigation state changed: ", {
      url: navState.url,
      title: navState.title,
      loading: navState.loading,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
    });
    // Reset error state when navigation starts successfully
    if (navState.loading && !hasError) {
      setIsLoading(true);
    }
  };

  if (!checkoutLink) {
    return (
      <ScreenContainer padding={0}>
        <HeaderTitle title="Checkout" leftIcon="true" onPressLeft={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <CustomText variant="subtitle1">No checkout link provided</CustomText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle
        title="Checkout"
        leftIcon="true"
        onPressLeft={() => navigation.goBack()}
      />
      <Card
        style={[globalStyles.whiteSheetContainer, { flex: 1, marginTop: 10, backgroundColor: '#fff',borderBottomLeftRadius:0,borderBottomRightRadius:0 }]}
      >
        {isLoading && !hasError && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
        {hasError && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              padding: 20,
            }}
          >
            <CustomText variant="subtitle1" style={{ textAlign: "center", marginBottom: 10 }}>
              Failed to load checkout page
            </CustomText>
            <TouchableOpacity
              onPress={() => {
                retryCountRef.current = 0; // Reset retry count on manual retry
                setHasError(false);
                setIsLoading(true);
                webviewRef.current?.reload();
              }}
              style={{
                backgroundColor: theme?.colors?.palette?.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <CustomText variant="body1" style={{ color: "white" }}>
                Retry
              </CustomText>
            </TouchableOpacity>
            {checkoutLink && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const canOpen = await Linking.canOpenURL(checkoutLink);
                    if (canOpen) {
                      await Linking.openURL(checkoutLink);
                      navigation.goBack();
                    } else {
                      showError("Unable to open link in browser");
                    }
                  } catch (error) {
                    console.error("Error opening URL:", error);
                    showError("Unable to open link in browser");
                  }
                }}
                style={{
                  backgroundColor: theme?.colors?.palette?.grey500,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                <CustomText variant="body1" style={{ color: "white" }}>
                  Open in Safari
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ uri: checkoutLink }}
          // injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onLoadEnd={handleLoadEnd}
          onLoadStart={handleLoadStart}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          onHttpError={handleHttpError}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          style={{ flex: 1 }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          allowsFullscreenVideo={false}
          allowsProtectedMedia={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          {...(Platform.OS === "ios" && {
            allowsLinkPreview: false,
            bounces: false,
            allowsBackForwardNavigationGestures: true,
            incognito: false,
            // iOS-specific: Set user agent to avoid detection issues
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            // iOS-specific: Enable data detectors
            dataDetectorTypes: "none",
            // iOS-specific: Disable selection
            textInteractionEnabled: true,
          })}
          {...(Platform.OS === "android" && {
            androidLayerType: "hardware",
            androidHardwareAccelerationDisabled: false,
            cacheMode: "LOAD_DEFAULT",
          })}
        />
      </Card>
    </ScreenContainer>
  );
};

export default CoinflowCheckoutWebView;

