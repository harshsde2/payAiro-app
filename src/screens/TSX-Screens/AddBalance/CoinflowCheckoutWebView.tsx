import React, { useRef, useState } from "react";
import { Platform, View, ActivityIndicator, TouchableOpacity, Linking, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import WebView from "react-native-webview";
import { Card, CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useTheme } from "styles";
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

  console.log("checkoutLink ->", JSON.stringify(checkoutLink, null, 2));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = React.useRef(0);
  const hasHandledTerminalEventRef = React.useRef(false);
  const isMountedRef = React.useRef(true);
  const maxRetries = 2;

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Timeout handler - if page doesn't load in 60 seconds (longer for iOS), show error
  React.useEffect(() => {
    const timeoutDuration = Platform.OS === "ios" ? 60000 : 30000; // iOS gets 60 seconds
    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return;
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

  const handleCheckoutSuccess = () => {
    if (hasHandledTerminalEventRef.current) return;
    hasHandledTerminalEventRef.current = true;
    setTimeout(() => {
      if (!isMountedRef.current) return;
      navigation.goBack();
    }, 1500);
  };

  const handleCheckoutFailure = (status?: string, message?: string) => {
    if (hasHandledTerminalEventRef.current) return;
    hasHandledTerminalEventRef.current = true;
    if (isMountedRef.current) {
      setIsLoading(false);
      setHasError(true);
    }
    const readableStatus = status ? ` (${status})` : "";
    showError(message || `Payment was not completed${readableStatus}.`);
  };

  const handleMessage = (event: any) => {
    const rawMessage = event?.nativeEvent?.data;
    if (!rawMessage) return;

    if (rawMessage === "PAYMENT_SUCCESS") {
      handleCheckoutSuccess();
      return;
    }

    let parsedMessage: any = null;
    try {
      parsedMessage = JSON.parse(rawMessage);
    } catch (_error) {
      return;
    }

    const eventType = parsedMessage?.type || parsedMessage?.event;
    const payload = parsedMessage?.data || parsedMessage?.payload || {};

    if (eventType === "payment-status") {
      const status = payload?.status || parsedMessage?.status;
      if (status === "success") {
        handleCheckoutSuccess();
        return;
      }
      if (["failed", "canceled", "cancelled", "failover"].includes(String(status))) {
        handleCheckoutFailure(String(status), payload?.message);
        return;
      }
    }

    if (eventType === "close") {
      hasHandledTerminalEventRef.current = true; // Prevent late success/failure race
      navigation.goBack();
      return;
    }

    if (eventType === "error") {
      handleCheckoutFailure("error", payload?.message || parsedMessage?.message);
    }
  };

  const handleLoadEnd = (syntheticEvent: any) => {
    const nativeEvent = syntheticEvent?.nativeEvent;
    if (!nativeEvent) return;
    if (__DEV__) {
      console.log("WebView load ended: ", nativeEvent.url);
    }
    if (isMountedRef.current) {
      setIsLoading(false);
      setHasError(false);
    }
    retryCountRef.current = 0; // Reset retry count on successful load
  };

  const handleLoadStart = (syntheticEvent: any) => {
    const nativeEvent = syntheticEvent?.nativeEvent;
    if (!nativeEvent) return;
    if (__DEV__) {
      console.log("WebView load started: ", nativeEvent.url);
    }
    if (isMountedRef.current) {
      setIsLoading(true);
      setHasError(false);
    }
  };

  const handleLoadProgress = (syntheticEvent: any) => {
    if (__DEV__ && syntheticEvent?.nativeEvent) {
      const progress = Math.round((syntheticEvent.nativeEvent.progress ?? 0) * 100);
      console.log("WebView load progress: ", progress + "%");
    }
  };

  const handleError = (syntheticEvent: any) => {
    const nativeEvent = syntheticEvent?.nativeEvent;
    if (!nativeEvent) return;
    if (__DEV__) {
      console.error("WebView error: ", JSON.stringify(nativeEvent, null, 2));
    }

    // Retryable network errors: iOS (-1001 timeout, -1005 connection lost), Android (-2, -6, -7, -8, -9)
    const iosRetryable = [-1001, -1005];
    const androidRetryable = [-2, -6, -7, -8, -9]; // ERR_FAILED, CONNECTION_REFUSED, TIMED_OUT, CONNECTION_TIMEOUT, CONNECTION_RESET
    const retryableErrors = Platform.OS === "ios" ? iosRetryable : androidRetryable;
    const shouldRetry =
      retryableErrors.includes(nativeEvent?.code) && retryCountRef.current < maxRetries;

    if (shouldRetry) {
      const errorNames: Record<number, string> = {
        [-1001]: "timeout",
        [-1005]: "connection lost",
        [-6]: "connection refused",
        [-7]: "timed out",
        [-8]: "connection timeout",
        [-9]: "connection reset",
      };
      const errorName = errorNames[nativeEvent?.code] ?? "network";
      if (__DEV__) {
        console.log(`${Platform.OS} ${errorName} error detected (attempt ${retryCountRef.current + 1}/${maxRetries}), attempting automatic reload...`);
      }
      retryCountRef.current += 1;
      // Wait a bit then reload
      setTimeout(() => {
        if (!isMountedRef.current) return;
        if (webviewRef.current) {
          if (__DEV__) {
            console.log("Reloading WebView after network error...");
          }
          webviewRef.current.reload();
          setIsLoading(true);
          setHasError(false);
        }
      }, 3000); // 3 second delay before retry
      return; // Exit early, don't set error state yet
    }
    
    if (isMountedRef.current) {
      setIsLoading(false);
      setHasError(true);
    }
    const errorMessage = nativeEvent?.description || nativeEvent?.message || "Unknown error";
    if (__DEV__) {
      console.error("Error details:", {
        code: nativeEvent?.code,
        domain: nativeEvent?.domain,
        description: nativeEvent?.description,
        url: nativeEvent?.url,
        retryCount: retryCountRef.current,
      });
    }

    // Show error with option to open in external browser
    if (retryCountRef.current >= maxRetries && checkoutLink) {
      const openInBrowserLabel = Platform.OS === "ios" ? "Open in Safari" : "Open in Browser";
      const openInBrowserMessage =
        Platform.OS === "ios"
          ? "Unable to load the checkout page in the app. Would you like to open it in Safari instead?"
          : "Unable to load the checkout page in the app. Would you like to open it in your browser instead?";

      Alert.alert("Failed to Load Checkout", openInBrowserMessage, [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            showError(`Failed to load checkout page: ${errorMessage}`);
          },
        },
        {
          text: openInBrowserLabel,
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(checkoutLink);
              if (canOpen) {
                await Linking.openURL(checkoutLink);
                if (isMountedRef.current) {
                  setTimeout(() => navigation.goBack(), 500);
                }
              } else {
                showError("Unable to open link in browser");
              }
            } catch (error) {
              if (__DEV__) {
                console.error("Error opening URL:", error);
              }
              showError("Unable to open link in browser");
            }
          },
        },
      ]);
    } else if (retryCountRef.current >= maxRetries) {
      showError(`Failed to load checkout page: ${errorMessage}`);
    }
  };

  const handleHttpError = (syntheticEvent: any) => {
    const nativeEvent = syntheticEvent?.nativeEvent;
    if (!nativeEvent) return;
    if (__DEV__) {
      console.error("WebView HTTP error: ", JSON.stringify(nativeEvent, null, 2));
    }
    if (isMountedRef.current) {
      setIsLoading(false);
      setHasError(true);
    }
    const statusCode = nativeEvent?.statusCode ?? "Unknown";
    const description = nativeEvent?.description ?? "Failed to load page";
    showError(`HTTP Error ${statusCode}: ${description}`);
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const requestUrl = request?.url ?? "";
    if (__DEV__) {
      console.log("WebView navigation request: ", requestUrl);
    }

    const lowerCaseUrl = requestUrl.toLowerCase();
    if (
      lowerCaseUrl.includes("payment_status=success") ||
      lowerCaseUrl.includes("status=success") ||
      lowerCaseUrl.includes("order_complete")
    ) {
      handleCheckoutSuccess();
    }

    if (
      lowerCaseUrl.includes("payment_status=failed") ||
      lowerCaseUrl.includes("payment_status=canceled") ||
      lowerCaseUrl.includes("payment_status=cancelled") ||
      lowerCaseUrl.includes("order_failed") ||
      lowerCaseUrl.includes("order_cancelled")
    ) {
      handleCheckoutFailure("failed");
    }

    // Allow all navigation
    return true;
  };

  const handleNavigationStateChange = (navState: any) => {
    if (__DEV__ && navState) {
      console.log("WebView navigation state changed: ", {
        url: navState.url,
        title: navState.title,
        loading: navState.loading,
      });
    }
    // Show loading when navigating within WebView (e.g. redirects) - only if not in error state
    if (navState?.loading && !hasError && isMountedRef.current) {
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
                    if (__DEV__) {
                      console.error("Error opening URL:", error);
                    }
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
                  {Platform.OS === "ios" ? "Open in Safari" : "Open in Browser"}
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

