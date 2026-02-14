/**
 * DebugTestScreen – Release / TestFlight debug info when not connected to Xcode.
 * All values are copyable. Use "Copy all" to paste into support ticket or Slack.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { CustomText } from "tsx-components";
import FCMService from "services/FCMService";
import messaging from "@react-native-firebase/messaging";
import DeviceInfo from "react-native-device-info";
import { getItem, STORAGE_KEYS } from "storage/mmkv";
import { SvgIcons } from "constants/svgs";

const COPY_HINT = "Tap to copy";

type RowStyles = ReturnType<typeof rowStyles>;

function showCopyFeedback() {
  if (Platform.OS === "android") {
    const { ToastAndroid } = require("react-native");
    ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
  } else {
    Alert.alert("Copied", "Copied to clipboard");
  }
}

function CopyableRow({
  label,
  value,
  rowStyles: styles,
}: {
  label: string;
  value: string | null | undefined;
  rowStyles: RowStyles;
}) {
  const [copied, setCopied] = useState(false);
  const displayValue = value ?? "—";

  const handleCopy = useCallback(() => {
    if (displayValue === "—") return;
    Clipboard.setString(displayValue);
    setCopied(true);
    showCopyFeedback();
    setTimeout(() => setCopied(false), 1500);
  }, [displayValue]);

  return (
    <Pressable onPress={handleCopy} style={styles.row}>
      <View style={styles.labelWrap}>
        <CustomText variant="caption" style={styles.label}>
          {label}
        </CustomText>
        <Text style={styles.value} selectable numberOfLines={4}>
          {displayValue}
        </Text>
      </View>
      <CustomText variant="caption" style={copied ? styles.copiedHint : styles.copyHint}>
        {copied ? "Copied!" : COPY_HINT}
      </CustomText>
    </Pressable>
  );
}

export default function DebugTestScreen() {
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const rs = rowStyles(theme);
  const styles = { ...globalStyles, ...rs };
  const navigation = useNavigation<any>();

  const fcmTokenRedux = useSelector((state: any) => state.authenticationSlice?.fcmToken);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [fcmTokenLive, setFcmTokenLive] = useState<string | null>(null);
  const [apnsToken, setApnsToken] = useState<string | null | "loading">("loading");
  const [notificationPermission, setNotificationPermission] = useState<string>("loading");
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [buildNumber, setBuildNumber] = useState<string | null>(null);
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [deviceModel, setDeviceModel] = useState<string | null>(null);
  const [systemVersion, setSystemVersion] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastNotificationAt, setLastNotificationAt] = useState<string | null>(null);

  const loadDeviceInfo = useCallback(async () => {
    try {
      const [version, build, bundle, model, system] = await Promise.all([
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getBundleId(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
      ]);
      setAppVersion(version || null);
      setBuildNumber(build || null);
      setBundleId(bundle || null);
      setDeviceModel(model || null);
      setSystemVersion(system || null);
    } catch {
      setAppVersion(null);
      setBuildNumber(null);
      setBundleId(null);
      setDeviceModel(null);
      setSystemVersion(null);
    }
  }, []);

  const loadPushInfo = useCallback(async () => {
    const fcm = FCMService.getInstance();
    setLastError(null);
    try {
      const [id, token, perm] = await Promise.all([
        fcm.getDeviceId(),
        fcm.getToken(),
        (async () => {
          const status = await messaging().hasPermission();
          return status === 1 ? "granted" : status === 0 ? "denied" : status === 2 ? "provisional" : `unknown (${status})`;
        })(),
      ]);
      setDeviceId(id ?? null);
      setFcmTokenLive(token ?? null);
      setNotificationPermission(perm);
    } catch (e: any) {
      setLastError(e?.message ?? String(e));
      setDeviceId(null);
      setFcmTokenLive(null);
      setNotificationPermission("error");
    }
    if (Platform.OS === "ios") {
      try {
        const apns = await messaging().getAPNSToken();
        setApnsToken(apns ?? null);
      } catch {
        setApnsToken(null);
      }
    }
  }, []);

  useEffect(() => {
    loadDeviceInfo();
  }, [loadDeviceInfo]);

  useEffect(() => {
    let mounted = true;
    loadPushInfo().finally(() => { if (!mounted) return; });
    return () => { mounted = false; };
  }, [loadPushInfo]);

  useEffect(() => {
    setLastNotificationAt(getItem(STORAGE_KEYS.DEBUG_LAST_NOTIFICATION_AT) ?? null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastError(null);
    await loadPushInfo();
    setLastNotificationAt(getItem(STORAGE_KEYS.DEBUG_LAST_NOTIFICATION_AT) ?? null);
    setRefreshing(false);
  }, [loadPushInfo]);

  const fcmToken = fcmTokenRedux ?? fcmTokenLive;

  const copyAllBlock = useCallback(() => {
    const lines = [
      "--- PayAiro Debug (TestFlight/Release) ---",
      `Timestamp: ${new Date().toISOString()}`,
      `Build: ${__DEV__ ? "debug" : "release"} | ${Platform.OS}`,
      `APNs environment: ${__DEV__ ? "Sandbox (debug)" : "Production (TestFlight/release)"}`,
      `App version: ${appVersion ?? "—"}`,
      `Build number: ${buildNumber ?? "—"}`,
      `Bundle ID: ${bundleId ?? "—"}`,
      `Device: ${deviceModel ?? "—"} | OS: ${systemVersion ?? "—"}`,
      `Notification permission: ${notificationPermission}`,
      `FCM token (length ${fcmToken?.length ?? 0}): ${fcmToken ?? "—"}`,
      `FCM token from: ${fcmTokenRedux ? "Redux" : fcmTokenLive ? "Live" : "—"}`,
      `APNs token: ${apnsToken === "loading" ? "…" : apnsToken ?? "Not set"}`,
      `Device ID: ${deviceId ?? "—"}`,
      `Last notification received: ${lastNotificationAt ?? "Never"}`,
      lastError ? `Last error: ${lastError}` : null,
    ].filter(Boolean);
    Clipboard.setString(lines.join("\n"));
    showCopyFeedback();
  }, [
    appVersion,
    buildNumber,
    bundleId,
    deviceModel,
    systemVersion,
    notificationPermission,
    fcmToken,
    fcmTokenRedux,
    fcmTokenLive,
    apnsToken,
    deviceId,
    lastNotificationAt,
    lastError,
  ]);

  const isRelease = !__DEV__;
  const pushReady =
    (fcmToken?.length ?? 0) > 0 &&
    notificationPermission === "granted" &&
    (Platform.OS !== "ios" || (apnsToken !== "loading" && apnsToken != null));
  const statusMessage = pushReady
    ? "Push is configured. If notifications still don’t arrive on TestFlight, see checklist below."
    : [
        !fcmToken && "FCM token missing",
        notificationPermission !== "granted" && "Permission not granted",
        Platform.OS === "ios" && (!apnsToken || apnsToken === "loading") && "APNs token not set (iOS)",
      ]
        .filter(Boolean)
        .join(" · ") || "Checking…";

  return (
    <ScreenContainer>
      <HeaderTitle
        leftIcon={SvgIcons.SVGLeftArrow}
        title="Debug / Test"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={rs.buttonRow}>
          <Pressable style={[rs.button, rs.buttonSecondary]} onPress={onRefresh} disabled={refreshing}>
            {refreshing ? <ActivityIndicator size="small" color={theme.colors.palette.primary} /> : <CustomText variant="caption" style={rs.buttonText}>Refresh push info</CustomText>}
          </Pressable>
          <Pressable style={[rs.button, rs.buttonPrimary]} onPress={copyAllBlock}>
            <CustomText variant="caption" style={[rs.buttonText, rs.buttonTextPrimary]}>Copy all</CustomText>
          </Pressable>
        </View>

        <CustomText variant="caption" style={rs.sectionTitle}>
          Status
        </CustomText>
        <View style={[rs.row, pushReady ? rs.statusOk : rs.statusWarn]}>
          <CustomText variant="caption" style={rs.statusText}>{statusMessage}</CustomText>
        </View>
        {lastError ? (
          <View style={[rs.row, rs.statusError]}>
            <CustomText variant="caption" style={rs.statusErrorText}>Last error: {lastError}</CustomText>
          </View>
        ) : null}

        {isRelease ? (
          <>
            <CustomText variant="caption" style={rs.sectionTitle}>
              Works in debug, not in TestFlight?
            </CustomText>
            <View style={[rs.row, rs.checklistBox]}>
              <CustomText variant="caption" style={rs.checklistTitle}>
                Most likely cause: Production APNs not configured in Firebase.
              </CustomText>
              <CustomText variant="caption" style={rs.checklistText}>
                • Debug uses Sandbox APNs. TestFlight/Release uses Production APNs.{"\n"}
                • Firebase Console → Project Settings → Cloud Messaging → Apple app config.{"\n"}
                • Upload APNs Authentication Key (.p8) — required for production.{"\n"}
                • Bundle ID above must match your Apple app and Firebase.{"\n"}
                • In Apple Developer: App ID must have Push Notifications enabled; provisioning profile must include it.
              </CustomText>
            </View>
          </>
        ) : null}

        <CustomText variant="caption" style={rs.sectionTitle}>
          Build & environment
        </CustomText>
        <CopyableRow label="Build mode" value={__DEV__ ? "debug" : "release (TestFlight)"} rowStyles={rs} />
        <CopyableRow label="APNs environment" value={__DEV__ ? "Sandbox (debug builds)" : "Production (TestFlight / release)"} rowStyles={rs} />
        <CopyableRow label="Platform" value={Platform.OS} rowStyles={rs} />
        <CopyableRow label="App version" value={appVersion} rowStyles={rs} />
        <CopyableRow label="Build number" value={buildNumber} rowStyles={rs} />
        <CopyableRow label="Bundle ID" value={bundleId} rowStyles={rs} />
        <CopyableRow label="Device model" value={deviceModel} rowStyles={rs} />
        <CopyableRow label="OS version" value={systemVersion} rowStyles={rs} />

        <CustomText variant="caption" style={rs.sectionTitle}>
          Push / FCM
        </CustomText>
        <CopyableRow label="Notification permission" value={notificationPermission} rowStyles={rs} />
        <CopyableRow label="FCM Token" value={fcmToken} rowStyles={rs} />
        <CopyableRow label="FCM token length" value={fcmToken != null ? String(fcmToken.length) : "—"} rowStyles={rs} />
        <CopyableRow label="FCM token from" value={fcmTokenRedux ? "Redux cache" : fcmTokenLive ? "Live fetch" : "—"} rowStyles={rs} />
        <CopyableRow label="APNs Token (iOS)" value={apnsToken === "loading" ? undefined : apnsToken ?? "Not set"} rowStyles={rs} />
        <CopyableRow label="Device ID" value={deviceId} rowStyles={rs} />
        <CopyableRow label="Last notification received" value={lastNotificationAt ?? "Never (since install or clear)"} rowStyles={rs} />

        <CustomText variant="caption" style={rs.footer}>
          Use this screen on a TestFlight/release build when you can’t connect Xcode. Tap "Copy all" and paste into a ticket or Slack.
          {"\n\n"}
          If "Last notification received" stays "Never" on TestFlight but works in debug, fix Production APNs in Firebase (p8 key) and ensure Bundle ID matches.
        </CustomText>
      </ScrollView>
    </ScreenContainer>
  );
}

const rowStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: { padding: theme.spacing.spacing[4], paddingBottom: 40 },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: theme.spacing.spacing[3],
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      minWidth: 120,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonSecondary: {
      backgroundColor: theme.colors.palette.gray?.[200] ?? "#e0e0e0",
    },
    buttonPrimary: {
      backgroundColor: theme.colors.palette.primary,
    },
    buttonText: {
      color: theme.colors.palette.gray?.[700] ?? "#333",
    },
    buttonTextPrimary: {
      color: theme.colors.palette.white ?? "#fff",
    },
    sectionTitle: {
      marginTop: theme.spacing.spacing[4],
      marginBottom: theme.spacing.spacing[2],
      color: theme.colors.palette.gray?.[600],
    },
    row: {
      backgroundColor: theme.colors.palette.gray?.[100] ?? "#f0f0f0",
      padding: theme.spacing.spacing[3],
      borderRadius: 8,
      marginBottom: theme.spacing.spacing[2],
    },
    statusOk: {
      backgroundColor: theme.colors.palette.success ? `${theme.colors.palette.success}18` : "rgba(0,128,0,0.08)",
    },
    statusWarn: {
      backgroundColor: theme.colors.palette.warning ? `${theme.colors.palette.warning}18` : "rgba(255,165,0,0.12)",
    },
    statusError: {
      backgroundColor: "rgba(200,0,0,0.08)",
    },
    statusText: {
      color: theme.colors.palette.gray?.[800],
    },
    statusErrorText: {
      color: theme.colors.palette.error ?? "#c00",
    },
    checklistBox: {
      backgroundColor: theme.colors.palette.warning ? `${theme.colors.palette.warning}12` : "rgba(255,165,0,0.08)",
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.palette.warning ?? "#f90",
    },
    checklistTitle: {
      fontWeight: "600",
      color: theme.colors.palette.gray?.[800],
      marginBottom: 6,
    },
    checklistText: {
      color: theme.colors.palette.gray?.[700],
      lineHeight: 20,
    },
    labelWrap: { marginBottom: 4 },
    label: {
      color: theme.colors.palette.gray?.[600],
      marginBottom: 2,
    },
    value: {
      fontSize: 13,
      fontFamily: theme.typography?.fontFamily?.montserratRegular ?? "System",
      color: theme.colors.palette.black,
      flexShrink: 1,
    },
    copyHint: {
      color: theme.colors.palette.primary,
      marginTop: 4,
    },
    copiedHint: {
      color: theme.colors.palette.success ?? "green",
      marginTop: 4,
    },
    footer: {
      marginTop: theme.spacing.spacing[6],
      color: theme.colors.palette.gray?.[500],
      textAlign: "center",
    },
  });
