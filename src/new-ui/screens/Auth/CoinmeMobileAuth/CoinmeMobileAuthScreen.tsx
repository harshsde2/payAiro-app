import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import type { WebView as WebViewType } from "react-native-webview";
import { Canvas, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { AppIcon } from "@new-ui/assets/svgs";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { coinmeMobileAuthStyles } from "@new-ui/styles/screens/auth/coinmeMobileAuthStyles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  useCoinmeInstantLinkRequest,
  useCoinmeMobileAuthRequest,
} from "query/hooks/useAPIAuth";
import { getAuthResumeParams } from "auth/authSession";
import { getPublicDeviceIp } from "utils/getPublicDeviceIp";
import type {
  Coinme2faAuthMethod,
  CoinmeMobileAuthScreenParams,
} from "@new-ui/navigationTypes";
import type {
  CoinmeMobileAuthScreenNavigationProp,
  CoinmeMobileAuthScreenRouteProp,
} from "@new-ui/screens/Auth/types";
import {
  buildCoinmeVfpInjectedJs,
  getCompletePathMarkers,
  parseCoinmeWebViewMessage,
  tryFinishVfpFromUrl,
} from "@new-ui/screens/Auth/CoinmeMobileAuth/coinmeWebViewVfpScript";

const GLOW_PX = 150;
const GLOW_CENTER = GLOW_PX / 2;
const GLOW_RADIUS = GLOW_CENTER * 1.05;

// Mobile-auth runs headless behind the loader; if the carrier redirect chain
// never reaches the complete URL, give up and fall back to instant link.
const MOBILE_AUTH_WEBVIEW_TIMEOUT_MS = 30_000;

function normalizeUsNationalDigits(phone: string): string {
  const d = String(phone).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return d.slice(1);
  }
  return d;
}

function messageFromCoinmeBody(resp: any): string {
  const errData = resp?.data?.coinme?.errorResponse?.errorData;
  const first =
    Array.isArray(errData) && typeof errData[0]?.message === "string"
      ? errData[0].message.trim()
      : "";
  if (first) return first;
  if (typeof resp?.message === "string" && resp.message.trim()) {
    return resp.message.trim();
  }
  return "Something went wrong. Please try again.";
}

type Phase = "loading_initiate" | "webview" | "loading_finish";

const CoinmeMobileAuthScreen: React.FC = () => {
  const navigation = useNavigation<CoinmeMobileAuthScreenNavigationProp>();
  const route = useRoute<CoinmeMobileAuthScreenRouteProp>();
  const { theme } = useTheme();
  const styles = coinmeMobileAuthStyles(theme);
  const { mutateAsync: postCoinmeMobileAuth } = useCoinmeMobileAuthRequest();
  const { mutateAsync: postCoinmeInstantLink } = useCoinmeInstantLinkRequest();

  const authMethod: Coinme2faAuthMethod =
    route.params?.authMethod ?? "mobile_auth";
  const restartKey = route.params?.restartKey;

  const completePathMarkers = useMemo(
    () => getCompletePathMarkers(authMethod),
    [authMethod]
  );
  const injectedJavaScript = useMemo(
    () =>
      buildCoinmeVfpInjectedJs({
        pathMarkers: completePathMarkers,
        allowContentOnlyComplete: authMethod === "instant_link",
      }),
    [authMethod, completePathMarkers]
  );

  const [phase, setPhase] = useState<Phase>("loading_initiate");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const webViewRef = useRef<WebViewType>(null);
  const lastWebViewUrlRef = useRef("");
  const finishStarted = useRef(false);
  const webErrorShown = useRef(false);
  const initiateRequestIdRef = useRef<string | null>(null);
  const fallbackNavigatedRef = useRef(false);

  const coinmeResumeParams = useCallback((): CoinmeMobileAuthScreenParams => {
    const p = route.params;
    const resume = getAuthResumeParams();
    return {
      email: p?.email ?? resume?.email,
      phone: p?.phone ?? resume?.phone,
      username: p?.username ?? resume?.username,
      inputType: p?.inputType ?? resume?.inputType,
      isEmail: p?.isEmail ?? resume?.isEmail,
      data: p?.data,
    };
  }, [route.params]);

  const kycParams = useCallback(() => {
    const resume = coinmeResumeParams();
    return {
      email: resume.email,
      phone: resume.phone,
      username: resume.username,
      inputType: resume.inputType,
      isEmail: resume.isEmail,
      data: resume.data,
    };
  }, [coinmeResumeParams]);

  const openError = useCallback(
    (title: string, description: string) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR, {
        title,
        description,
      });
    },
    [navigation]
  );

  /** Silently restart this screen in instant_link mode (no user-facing error). */
  const fallbackToInstantLink = useCallback(
    (reason: string) => {
      if (fallbackNavigatedRef.current) return;
      fallbackNavigatedRef.current = true;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[Coinme2FA] mobile_auth failed, falling back to instant_link: ${reason}`);
      }
      navigation.replace(NAVIGATION_SCREENS.NEW_COINME_MOBILE_AUTH, {
        ...coinmeResumeParams(),
        authMethod: "instant_link",
        restartKey: Date.now(),
      });
    },
    [coinmeResumeParams, navigation]
  );

  /** mobile_auth failures retry silently via instant_link; instant_link failures surface. */
  const handleAuthFailure = useCallback(
    (title: string, description: string) => {
      if (authMethod === "mobile_auth") {
        fallbackToInstantLink(`${title}: ${description}`);
        return;
      }
      openError(title, description);
    },
    [authMethod, fallbackToInstantLink, openError]
  );

  useEffect(() => {
    let cancelled = false;
    finishStarted.current = false;
    webErrorShown.current = false;
    initiateRequestIdRef.current = null;
    fallbackNavigatedRef.current = false;
    setPhase("loading_initiate");
    setRedirectUrl(null);

    (async () => {
      const phoneRaw =
        route.params?.phone ?? getAuthResumeParams()?.phone;
      if (!phoneRaw || normalizeUsNationalDigits(phoneRaw).length < 10) {
        openError(
          "Phone required",
          "We could not verify your phone number. Please go back and create your account with a valid mobile number."
        );
        return;
      }

      const national = normalizeUsNationalDigits(phoneRaw);

      let deviceIp: string;
      try {
        deviceIp = await getPublicDeviceIp();
        // deviceIp = "172.58.83.64";
      } catch {
        if (!cancelled) {
          handleAuthFailure(
            "Connection issue",
            "We could not determine your network address. Check your connection and try again."
          );
        }
        return;
      }

      try {
        if (authMethod === "instant_link") {
          const resp = await postCoinmeInstantLink({
            step: "initiate",
            phone_country_code: 1,
            phone_national_number: national,
            deviceIp,
          });
          if (cancelled) return;

          if (!resp?.ok) {
            openError("Verification failed", messageFromCoinmeBody(resp));
            return;
          }

          const coinmeData = resp?.data?.coinme?.data ?? {};
          const authUrl =
            coinmeData.authUrl ??
            coinmeData.auth_url ??
            resp?.data?.instant_link?.auth_url;
          if (typeof authUrl !== "string" || !authUrl.trim()) {
            openError(
              "Verification failed",
              "Missing verification link from the server. Please try again."
            );
            return;
          }

          const requestIdRaw =
            coinmeData.requestId ?? coinmeData.request_id;
          const requestId =
            typeof requestIdRaw === "string" ? requestIdRaw.trim() : "";
          if (requestId) {
            initiateRequestIdRef.current = requestId;
          }

          setRedirectUrl(authUrl.trim());
          setPhase("webview");
          return;
        }

        const initiateBody = {
          step: "initiate" as const,
          phone_country_code: 1,
          phone_national_number: national,
          deviceIp,
          consentTransactionId: "100001",
          consentDescription: "Test descriptionAaa",
          consentCollectedTimestamp: "2024-01-09",
        };
        const resp = await postCoinmeMobileAuth(initiateBody);
        if (cancelled) return;

        if (!resp?.ok) {
          handleAuthFailure(
            "Verification failed",
            messageFromCoinmeBody(resp)
          );
          return;
        }

        const url =
          resp?.data?.coinme?.data?.redirectTargetUrl ??
          resp?.data?.coinme?.data?.redirect_target_url;
        if (typeof url !== "string" || !url.trim()) {
          handleAuthFailure(
            "Verification failed",
            "Missing redirect URL from the server. Please try again."
          );
          return;
        }

        const coinmeData = resp?.data?.coinme?.data ?? {};
        const requestIdRaw =
          coinmeData.requestId ?? coinmeData.request_id;
        const requestId =
          typeof requestIdRaw === "string" ? requestIdRaw.trim() : "";
        if (!requestId) {
          handleAuthFailure(
            "Verification failed",
            "Missing session from the server. Please try again."
          );
          return;
        }
        initiateRequestIdRef.current = requestId;

        setRedirectUrl(url.trim());
        setPhase("webview");
      } catch (e: any) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Something went wrong. Please try again.";
        handleAuthFailure("Request failed", String(msg));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authMethod,
    restartKey,
    openError,
    handleAuthFailure,
    postCoinmeInstantLink,
    postCoinmeMobileAuth,
    route.params?.phone,
  ]);

  // Watchdog: the mobile-auth WebView is hidden, so a hung redirect chain
  // would strand the user on the loader forever. Phase moves to
  // "loading_finish" once the VFP arrives, which clears the timer.
  useEffect(() => {
    if (phase !== "webview" || authMethod !== "mobile_auth") return;
    const timer = setTimeout(() => {
      if (finishStarted.current) return;
      fallbackToInstantLink(
        `webview did not complete within ${MOBILE_AUTH_WEBVIEW_TIMEOUT_MS}ms`
      );
    }, MOBILE_AUTH_WEBVIEW_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [authMethod, fallbackToInstantLink, phase]);

  const runFinish = useCallback(
    async (vfp: string) => {
      const phoneRaw =
        route.params?.phone ?? getAuthResumeParams()?.phone;
      if (!phoneRaw) {
        finishStarted.current = false;
        // Hard error for both methods — instant_link needs the same phone.
        openError("Verification failed", "Missing phone number.");
        return;
      }
      const national = normalizeUsNationalDigits(phoneRaw);

      setPhase("loading_finish");

      try {
        if (authMethod === "instant_link") {
          const finishBody: Record<string, unknown> = {
            step: "finish",
            phone_country_code: 1,
            phone_national_number: national,
            verificationFingerprint: vfp,
          };
          const requestId = initiateRequestIdRef.current;
          if (requestId?.trim()) {
            finishBody.requestId = requestId;
          }

          const resp = await postCoinmeInstantLink(finishBody);

          if (resp?.ok === true && resp?.data?.phone_verified === true) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: NAVIGATION_SCREENS.NEW_KYC,
                    params: kycParams(),
                  },
                ],
              })
            );
            return;
          }

          handleAuthFailure("Verification failed", messageFromCoinmeBody(resp));
          return;
        }

        const requestId = initiateRequestIdRef.current;
        if (!requestId?.trim()) {
          handleAuthFailure(
            "Verification failed",
            "Session expired. Go back and start verification again."
          );
          finishStarted.current = false;
          return;
        }

        const finishBody = {
          step: "finish" as const,
          requestId,
          phone_country_code: 1,
          phone_national_number: national,
          verificationFingerprint: vfp,
        };
        const resp = await postCoinmeMobileAuth(finishBody);

        if (resp?.ok === true && resp?.data?.phone_verified === true) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: NAVIGATION_SCREENS.NEW_KYC,
                  params: kycParams(),
                },
              ],
            })
          );
          return;
        }

        handleAuthFailure("Verification failed", messageFromCoinmeBody(resp));
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Something went wrong. Please try again.";
        handleAuthFailure("Request failed", String(msg));
      }
    },
    [
      authMethod,
      kycParams,
      navigation,
      handleAuthFailure,
      openError,
      postCoinmeInstantLink,
      postCoinmeMobileAuth,
      route.params?.phone,
    ]
  );

  const tryStartFinish = useCallback(
    (vfp: string) => {
      if (!vfp || finishStarted.current) return;
      finishStarted.current = true;
      void runFinish(vfp);
    },
    [runFinish]
  );

  const attemptFinishFromWebViewUrl = useCallback(
    (url: string) => {
      if (__DEV__ && authMethod === "instant_link" && url) {
        // eslint-disable-next-line no-console
        console.log("[Coinme2FA instant_link] WebView URL:", url);
      }
      const vfp = tryFinishVfpFromUrl(url, completePathMarkers);
      if (vfp) tryStartFinish(vfp);
    },
    [authMethod, completePathMarkers, tryStartFinish]
  );

  const onWebViewNavChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState.url || "";
      lastWebViewUrlRef.current = url;
      attemptFinishFromWebViewUrl(url);
    },
    [attemptFinishFromWebViewUrl]
  );

  const onWebViewLoadEnd = useCallback(() => {
    webViewRef.current?.injectJavaScript(injectedJavaScript);
    attemptFinishFromWebViewUrl(
      lastWebViewUrlRef.current || redirectUrl || ""
    );
  }, [attemptFinishFromWebViewUrl, injectedJavaScript, redirectUrl]);

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      const msg = parseCoinmeWebViewMessage(event.nativeEvent.data);
      if (msg) tryStartFinish(msg.vfp);
    },
    [tryStartFinish]
  );

  const loadingContent = (
    <View style={styles.loadingRoot}>
      <View style={styles.heroBlock}>
        <View style={styles.glowSquare}>
          <Canvas style={styles.glowCanvas}>
            <Rect x={0} y={0} width={GLOW_PX} height={GLOW_PX}>
              <RadialGradient
                c={vec(GLOW_CENTER, GLOW_CENTER)}
                r={GLOW_RADIUS}
                colors={[
                  theme.colors.secondary,
                  theme.colors.tertiary,
                  theme.colors.white,
                ]}
                positions={[0, 0.22, 1]}
              />
            </Rect>
          </Canvas>
        </View>
        <View style={styles.starsOverlay} pointerEvents="none">
          <View style={styles.starSmallWrap}>
            <AppIcon.Stars width={52} height={52} />
          </View>
          <View style={styles.starLargeWrap}>
            <AppIcon.Stars width={76} height={76} />
          </View>
        </View>
      </View>
      <CustomText
        variant="h2"
        fontWeight="bold"
        style={styles.title}
        color={theme.colors.black}
        useThemeColor={false}
      >
        Setting up your Account…
      </CustomText>
    </View>
  );

  if (phase === "webview" && redirectUrl) {
    // Mobile-auth needs no user interaction — run its WebView invisibly
    // behind the loader so a fallback to instant_link is seamless.
    const hideWebView = authMethod === "mobile_auth";
    return (
      <ScreenWrapper
        gradient="none"
        backgroundColor={theme.colors.white}
        contentStyle={{ flex: 1 }}
      >
        <View
          style={hideWebView ? styles.hiddenWebviewContainer : styles.webview}
          pointerEvents={hideWebView ? "none" : "auto"}
        >
          <WebView
            ref={webViewRef}
            style={styles.webview}
            source={{ uri: redirectUrl }}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleWebViewMessage}
            onNavigationStateChange={onWebViewNavChange}
            onLoadEnd={onWebViewLoadEnd}
            originWhitelist={["*"]}
            onError={() => {
              if (finishStarted.current || webErrorShown.current) return;
              webErrorShown.current = true;
              handleAuthFailure(
                "Web page error",
                "We could not open the verification page. Check your mobile data connection and try again."
              );
            }}
            onHttpError={() => {
              if (finishStarted.current || webErrorShown.current) return;
              webErrorShown.current = true;
              handleAuthFailure(
                "Web page error",
                "The verification page could not be loaded. Please try again."
              );
            }}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
          />
        </View>
        {hideWebView ? (
          <View style={styles.loaderOverlay} pointerEvents="none">
            {loadingContent}
          </View>
        ) : null}
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      gradient="none"
      backgroundColor={theme.colors.white}
      contentStyle={{ flex: 1 }}
    >
      {loadingContent}
    </ScreenWrapper>
  );
};

export default CoinmeMobileAuthScreen;
