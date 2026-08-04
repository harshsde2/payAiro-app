import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  Code,
} from "react-native-vision-camera";
import { pickImageFromGallery } from "../../utils/ImagePicker";
import { colors, useTheme } from "styles";
import { CustomText } from "tsx-components";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import { PayAiroQRScanner, QRScannerError, QRScannerErrorCode } from "../../utils/PayAiroQRScanner";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useSelector } from "react-redux";
import { useAppLock } from "hooks/useAppLock";
import { useCameraPermission } from "hooks/useCameraPermission";
import QRScannerOverlay from "./QRScannerOverlay";
import { ReceiveQRSheet } from "@new-ui/components/common-components/ReceiveQRSheet";
import type { IReceiveQRSheetRef } from "@new-ui/components/common-components/ReceiveQRSheet";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useSelectorAction from "hooks/useSelectorAction";
import { showError } from "utils/toast";
import { isWalletAddress, normalizeWalletCandidate } from "utils/walletAddress";

const { width, height } = Dimensions.get("window");

// Scan area size for region of interest (iOS optimization)
const SCAN_AREA_SIZE = width * 0.7;

/**
 * The only two QR codes PayAiro's scanner accepts:
 *  - `payairo`: our PayAiro-to-PayAiro receive QR — a JSON object
 *    `{ type: "receive", username, tag }` (from ReceiveQRSheet). → prefill username.
 *  - `wallet`:  a plain crypto wallet address (from the Crypto Receive QR). → prefill address.
 * Anything else is `invalid`.
 */
type ScanResult =
  | { kind: "payairo"; username: string }
  | { kind: "wallet"; address: string }
  | { kind: "invalid" };

/** Classify a raw scanned/decoded QR string into one of the supported kinds. */
const classifyScannedQR = (raw: string | null | undefined): ScanResult => {
  const value = String(raw ?? "").trim();
  if (!value) return { kind: "invalid" };

  // 1) Our PayAiro receive QR is a JSON object with a username/tag.
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = null;
  }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as { type?: unknown; username?: unknown; tag?: unknown };
    const username = String(obj.username ?? obj.tag ?? "").trim();
    const typeStr = String(obj.type ?? "").toLowerCase();
    if (username && (typeStr === "receive" || "tag" in obj || "username" in obj)) {
      return { kind: "payairo", username };
    }
    // A JSON object that isn't our receive QR (order/merchant/etc.) is not supported.
    return { kind: "invalid" };
  }

  // 2) Plain string → only a valid wallet address is accepted.
  const candidate = normalizeWalletCandidate(value);
  if (isWalletAddress(candidate)) {
    return { kind: "wallet", address: candidate };
  }

  return { kind: "invalid" };
};

export default function Scans(): React.ReactElement {
  const { theme } = useTheme();
  const { isCrypto ,} = useSelector((state: unknown) => (state as { authenticationSlice: { isCrypto: boolean } }).authenticationSlice);
  const { walletData } = useSelectorAction() as any;
  const myUsername = walletData?.username;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isVisible, setisVisible] = useState<boolean>(false);
  const [torchMode, setTorchMode] = useState<"on" | "off">("off");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const cameraRef = useRef<Camera>(null);
  const isProcessingRef = useRef<boolean>(false);
  const receiveSheetRef = useRef<IReceiveQRSheetRef>(null);

  const { setNativeModalVisible } = useAppLock();
  
  // Camera permission hook with comprehensive handling
  const {
    hasPermission,
    isLoading: isPermissionLoading,
    permissionStatus,
    canAskAgain,
    requestPermission,
    openSettings,
    showPermissionDeniedAlert,
  } = useCameraPermission();

  // Get back camera device
  const device = useCameraDevice("back");

  // Re-arm the scanner after a rejected scan so the user can try again.
  const resumeScanning = useCallback((): void => {
    isProcessingRef.current = false;
    setIsScanning(true);
    setIsCameraActive(true);
  }, []);

  /**
   * Route a classified QR to NewSend (username or wallet prefilled) or reject it.
   * Shared by live-camera and gallery-upload paths.
   * @returns true if navigation happened; false if rejected (caller resumes scanning).
   */
  const routeScannedQR = useCallback(
    (rawValue: string | null | undefined): boolean => {
      const result = classifyScannedQR(rawValue);

      if (result.kind === "invalid") {
        showError(
          "Invalid QR code",
          "This isn't a PayAiro QR code. Scan a PayAiro payment QR or a crypto wallet QR."
        );
        return false;
      }

      if (result.kind === "payairo") {
        // Guard against scanning your own PayAiro code.
        if (
          myUsername &&
          result.username.toLowerCase() === String(myUsername).toLowerCase()
        ) {
          showError("Invalid QR code", "You can't scan your own QR code.");
          return false;
        }
        navigation.navigate(NAVIGATION_SCREENS.NEW_SEND, {
          requested: false,
          sender: result.username,
        });
        return true;
      }

      // Wallet address → prefill on NewSend; its Proceed handles the external send.
      navigation.navigate(NAVIGATION_SCREENS.NEW_SEND, {
        requested: false,
        sender: result.address,
      });
      return true;
    },
    [myUsername, navigation]
  );

  // Handle QR code detection from camera
  const handleQRCodeScanned = useCallback(
    (codes: Code[]): void => {
      // Prevent multiple rapid scans
      if (isProcessingRef.current || codes.length === 0) {
        return;
      }

      const codeValue = codes[0]?.value;
      if (!codeValue || codeValue.length === 0) {
        return;
      }

      // Set processing flag to prevent duplicate navigation
      isProcessingRef.current = true;
      setIsScanning(false);

      const navigated = routeScannedQR(codeValue);
      if (!navigated) {
        resumeScanning();
      }
    },
    [resumeScanning, routeScannedQR]
  );

  // Code scanner configuration - optimized for QR codes
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: handleQRCodeScanned,
  });

  // Reset scanning state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
      setIsCameraActive(true);
      isProcessingRef.current = false;
      
      return () => {
        // Cleanup when leaving screen
        setIsCameraActive(false);
        setIsScanning(false);
      };
    }, [])
  );

  const toggleTorchMode = useCallback((): void => {
    const newMode = torchMode === "off" ? "on" : "off";
    console.log("Toggling torch mode to:", newMode);
    setTorchMode(newMode);
  }, [torchMode]);

  const uploadFromGallery = useCallback(async (): Promise<void> => {
    setNativeModalVisible(true);
    
    try {
      const pickedImage = await pickImageFromGallery();

      if (!pickedImage || !pickedImage.uri) {
        Alert.alert("Error", "No image selected.");
        setNativeModalVisible(false);
        return;
      }

      try {
        // Scan QR code using native module (ZXing on Android, Vision on iOS)
        console.log("Starting native QR decode for image:", pickedImage.uri);

        const scanResult = await PayAiroQRScanner.scanQRCodeFromImage(pickedImage.uri);

        if (!scanResult) {
          console.log("No QR code found in image");
          Alert.alert(
            "No QR Code Found",
            "No QR code was detected in the selected image. Please try another image."
          );
          setNativeModalVisible(false);
          return;
        }

        const codeStringValue = scanResult.value;
        console.log("QR Code scanned from gallery:", codeStringValue);

        // Same classification as the live camera: PayAiro username, wallet address, or
        // invalid. `routeScannedQR` shows the invalid-QR error itself when unsupported.
        setIsScanning(false);
        routeScannedQR(codeStringValue);
      } catch (error) {
        console.log("QR Decode Error:", error);
        
        // Handle specific error types
        if (error instanceof QRScannerError) {
          switch (error.code) {
            case QRScannerErrorCode.IMAGE_LOAD_FAILED:
              Alert.alert("Error", "Failed to load the selected image. Please try another image.");
              break;
            case QRScannerErrorCode.INVALID_URI:
              Alert.alert("Error", "Invalid image path. Please try selecting the image again.");
              break;
            case QRScannerErrorCode.MODULE_NOT_AVAILABLE:
              Alert.alert("Error", "QR scanner is not available. Please restart the app.");
              break;
            default:
              Alert.alert(
                "No QR Code Found",
                "No QR code was detected in the selected image. Please try another image."
              );
          }
        } else {
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again."
          );
        }
      } finally {
        setTimeout(() => setNativeModalVisible(false), 1000);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Unable to access the selected image.");
      setNativeModalVisible(false);
    }
  }, [navigation, routeScannedQR, setNativeModalVisible]);

  // Handle permission request
  const handleRequestPermission = useCallback(async (): Promise<void> => {
    if (canAskAgain) {
      await requestPermission();
    } else {
      showPermissionDeniedAlert();
    }
  }, [canAskAgain, requestPermission, showPermissionDeniedAlert]);

  // Memoized permission denied UI
  const PermissionDeniedView = useMemo(() => (
    <View style={styles.permissionContainer}>
      <SvgIcons.AddCamera width={80} height={80} />
      <CustomText variant="h3" style={styles.permissionTitle}>
        Scan QR Codes
      </CustomText>
      <CustomText style={styles.permissionText}>
        {canAskAgain
          ? "PayAiro uses your camera to scan QR codes."
          : "Camera access is turned off. Please enable it in your device settings to scan QR codes."}
      </CustomText>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={handleRequestPermission}
        activeOpacity={0.8}
      >
        <CustomText style={styles.permissionButtonText}>
          {canAskAgain ? "Continue" : "Open Settings"}
        </CustomText>
      </TouchableOpacity>
    </View>
  ), [canAskAgain, handleRequestPermission]);

  // Loading state while checking permissions
  if (isPermissionLoading) {
    return (
      <ScreenContainer padding={0}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.palette.primary} />
          <CustomText style={styles.loadingText}>
            Initializing camera...
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  // Permission denied state
  if (!hasPermission) {
    return (
      <ScreenContainer padding={0}>
        {PermissionDeniedView}
      </ScreenContainer>
    );
  }

  // No camera device available (e.g., simulator)
  if (!device) {
    return (
      <ScreenContainer padding={0}>
        <View style={styles.errorContainer}>
          <SvgIcons.AddCamera width={80} height={80} />
          <CustomText variant="h3" style={styles.errorTitle}>
            Camera Unavailable
          </CustomText>
          <CustomText style={styles.errorText}>
            No camera device found. You can still scan QR codes from gallery.
          </CustomText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={uploadFromGallery}
            activeOpacity={0.8}
          >
            <CustomText style={styles.permissionButtonText}>
              Upload from Gallery
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => receiveSheetRef.current?.open()}
            activeOpacity={0.8}
          >
            <CustomText style={styles.secondaryButtonText}>
              Show My QR Code
            </CustomText>
          </TouchableOpacity>
        </View>
        <ReceiveQRSheet ref={receiveSheetRef} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={0}>
      {/* Top action bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SvgIcons.LeftArrowWhite width={25} height={25} />
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <SvgIcons.ImageIconWhite
            onPress={uploadFromGallery}
            width={25}
            height={25}
          />
          
          {torchMode === "on" ? <SvgIcons.FlashlightOn onPress={toggleTorchMode} width={25} height={25} /> : <SvgIcons.FlashlightOff onPress={toggleTorchMode} width={25} height={25} />}
          <SvgIcons.QRCodeWhite
            onPress={() => receiveSheetRef.current?.open()}
            width={30}
            height={30}
          />
        </View>
      </View>

      {/* Vision Camera */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isCameraActive && isScanning}
        codeScanner={codeScanner}
        torch={torchMode}
        enableZoomGesture={true}
        photo={false}
        video={false}
        audio={false}
      />

      {/* Custom QR Scanner Overlay */}
      <QRScannerOverlay
        scanAreaSize={SCAN_AREA_SIZE}
        borderColor={theme.colors.palette.secondary}
        borderWidth={3}
        cornerLength={35}
        cornerRadius={12}
        overlayOpacity={0.65}
        isScanning={isScanning}
      />

      <ReceiveQRSheet ref={receiveSheetRef} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(243, 251, 244, 1)",
  },
  camera: {
    width: width,
    height: Platform.OS === "ios" ? height * 0.85 : height * 0.95,
    alignSelf: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  topBarActions: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: "#fff",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  permissionButton: {
    marginTop: 32,
    backgroundColor: colors.green800,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: "#fff",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.green800,
  },
  secondaryButtonText: {
    color: colors.green800,
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
});
