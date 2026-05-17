import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { Canvas, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { AppIcon } from "@new-ui/assets/svgs";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { coinmeMobileAuthStyles } from "@new-ui/styles/screens/auth/coinmeMobileAuthStyles";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useCoinmeMobileAuthRequest } from "query/hooks/useAPIAuth";
import { getPublicDeviceIp } from "utils/getPublicDeviceIp";
import type {
  CoinmeMobileAuthScreenNavigationProp,
  CoinmeMobileAuthScreenRouteProp,
} from "@new-ui/screens/Auth/types";
import {
  COINME_WEBVIEW_VFP_INJECTED_JS,
  parseCoinmeWebViewMessage,
  tryFinishVfpFromUrl,
} from "@new-ui/screens/Auth/CoinmeMobileAuth/coinmeWebViewVfpScript";

const GLOW_PX = 150;
const GLOW_CENTER = GLOW_PX / 2;
const GLOW_RADIUS = GLOW_CENTER * 1.05;

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

  const [phase, setPhase] = useState<Phase>("loading_initiate");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const initStarted = useRef(false);
  const finishStarted = useRef(false);
  const webErrorShown = useRef(false);
  const initiateRequestIdRef = useRef<string | null>(null);

  const openError = useCallback(
    (title: string, description: string) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR, {
        title,
        description,
      });
    },
    [navigation]
  );

  const kycParams = useCallback(() => {
    const p = route.params;
    return {
      email: p.email,
      phone: p.phone,
      username: p.username,
      inputType: p.inputType,
      isEmail: p.isEmail,
      data: p.data,
    };
  }, [route.params]);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    let cancelled = false;

    (async () => {
      const phoneRaw = route.params?.phone;
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
          openError(
            "Connection issue",
            "We could not determine your network address. Check your connection and try again."
          );
        }
        return;
      }

      const initiateBody = {
        step: "initiate" as const,
        phone_country_code: 1,
        phone_national_number: national,
        deviceIp,
        consentTransactionId: "EXCM0005",
        consentDescription: "Test descriptionAaa",
        consentCollectedTimestamp: "2024-01-09",
      };
      try {
        const resp = await postCoinmeMobileAuth(initiateBody);
        if (cancelled) return;

        if (!resp?.ok) {
          openError("Verification failed", messageFromCoinmeBody(resp));
          return;
        }

        const url =
          resp?.data?.coinme?.data?.redirectTargetUrl ??
          resp?.data?.coinme?.data?.redirect_target_url;
        if (typeof url !== "string" || !url.trim()) {
          openError(
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
          openError(
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
        openError("Request failed", String(msg));
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount; route params are read at execution time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runFinish = useCallback(
    async (vfp: string) => {
      const phoneRaw = route.params?.phone;
      if (!phoneRaw) {
        finishStarted.current = false;
        openError("Verification failed", "Missing phone number.");
        return;
      }
      const national = normalizeUsNationalDigits(phoneRaw);

      const requestId = initiateRequestIdRef.current;
      if (!requestId?.trim()) {
        openError(
          "Verification failed",
          "Session expired. Go back and start verification again."
        );
        finishStarted.current = false;
        return;
      }

      setPhase("loading_finish");

      console.log("vfp", vfp);

      const finishBody = {
        step: "finish" as const,
        requestId,
        phone_country_code: 1,
        phone_national_number: national,
        verificationFingerprint: vfp,
      };
      try {
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

        openError("Verification failed", messageFromCoinmeBody(resp));
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Something went wrong. Please try again.";
        openError("Request failed", String(msg));
      }
    },
    [kycParams, navigation, openError, postCoinmeMobileAuth, route.params?.phone]
  );

  const tryStartFinish = useCallback(
    (vfp: string) => {
      if (!vfp || finishStarted.current) return;
      finishStarted.current = true;
      void runFinish(vfp);
    },
    [runFinish]
  );

  const onWebViewNavChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState.url || "";
      const vfp = tryFinishVfpFromUrl(url);
      if (vfp) tryStartFinish(vfp);
    },
    [tryStartFinish]
  );

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
    return (
      <ScreenWrapper
        gradient="none"
        backgroundColor={theme.colors.white}
        contentStyle={{ flex: 1 }}
      >
        <WebView
          style={styles.webview}
          source={{ uri: redirectUrl }}
          injectedJavaScript={COINME_WEBVIEW_VFP_INJECTED_JS}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={onWebViewNavChange}
          originWhitelist={["*"]}
          onError={() => {
            if (finishStarted.current || webErrorShown.current) return;
            webErrorShown.current = true;
            openError(
              "Web page error",
              "We could not open the verification page. Check your mobile data connection and try again."
            );
          }}
          onHttpError={() => {
            if (finishStarted.current || webErrorShown.current) return;
            webErrorShown.current = true;
            openError(
              "Web page error",
              "The verification page could not be loaded. Please try again."
            );
          }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
        />
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
