import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Camera, useCameraDevice, useCodeScanner, Code } from "react-native-vision-camera";
import { useTheme } from "styles";
import { qrScannerStyles } from "styles/GlobalStyles";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import { CustomText } from "tsx-components";
import { useCameraPermission } from "hooks/useCameraPermission";
import { pickImageFromGallery } from "utils/ImagePicker";
import { PayAiroQRScanner, QRScannerError, QRScannerErrorCode } from "utils/PayAiroQRScanner";
import { useAppLock } from "hooks/useAppLock";
import QRScannerOverlay from "screens/Scans/QRScannerOverlay";

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

const QRScanner = (): React.ReactElement => {
  const { theme } = useTheme();
  const route = useRoute();
  const { onScanSuccess } = route.params as any;
  const navigation = useNavigation<any>();

  const styles = qrScannerStyles(theme);

  const [torchMode, setTorchMode] = useState<"on" | "off">("off");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const isProcessingRef = useRef<boolean>(false);
  const device = useCameraDevice("back");
  const { setNativeModalVisible } = useAppLock();

  const {
    hasPermission,
    isLoading: isPermissionLoading,
    canAskAgain,
    requestPermission,
    showPermissionDeniedAlert,
  } = useCameraPermission();

  const parseQRCodeValue = useCallback((value: string): string | null => {
    if (!value || typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();

    // Check if it starts with { and ends with } - likely JSON
    if (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(trimmedValue);

        // Check if it's the expected JSON format with type "receive" and username
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          parsed.type === "receive" &&
          parsed.username &&
          typeof parsed.username === "string"
        ) {
          return parsed.username;
        }
        
        // If it's a valid JSON but not the expected format, reject it
        return null;
      } catch {
        // If JSON parsing fails, reject it (not a valid JSON)
        return null;
      }
    }

    // If it's not JSON, treat it as a plain string (wallet address)
    // Only accept non-empty strings
    if (trimmedValue.length > 0) {
      return trimmedValue;
    }
    
    // Reject empty values
    return null;
  }, []);

  const handleQRCodeScanned = useCallback((codes: Code[]): void => {
    if (isProcessingRef.current || codes.length === 0) {
      return;
    }

    const codeValue = codes[0]?.value ?? "";

    // Mark as processing immediately (synchronous)
    isProcessingRef.current = true;

    const parsedValue = parseQRCodeValue(codeValue);

    if (parsedValue === null) {
      // Invalid QR code format - reject it and allow retry
      isProcessingRef.current = false;
      return;
    }

    setIsScanning(false);

    // Call the callback with parsed value
    if (onScanSuccess) {
      onScanSuccess(parsedValue);
    }

    navigation.goBack();
  }, [navigation, onScanSuccess, parseQRCodeValue]);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: handleQRCodeScanned,
  });

  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
      setIsCameraActive(true);
      isProcessingRef.current = false;

      return () => {
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

  const handleRequestPermission = useCallback(async (): Promise<void> => {
    if (canAskAgain) {
      await requestPermission();
    } else {
      showPermissionDeniedAlert();
    }
  }, [canAskAgain, requestPermission, showPermissionDeniedAlert]);

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
        const scanResult = await PayAiroQRScanner.scanQRCodeFromImage(pickedImage.uri);

        if (!scanResult) {
          Alert.alert(
            "No QR Code Found",
            "No QR code was detected in the selected image. Please try another image."
          );
          setNativeModalVisible(false);
          return;
        }

        const parsedValue = parseQRCodeValue(scanResult.value ?? "");

        if (parsedValue === null) {
          Alert.alert("Invalid QR Code", "Please scan a valid QR code.");
          setNativeModalVisible(false);
          return;
        }

        isProcessingRef.current = true;
        setIsScanning(false);

        if (onScanSuccess) {
          onScanSuccess(parsedValue);
        }

        navigation.goBack();
      } catch (error) {
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
          Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
      } finally {
        setTimeout(() => setNativeModalVisible(false), 1000);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to access the selected image.");
      setNativeModalVisible(false);
    }
  }, [navigation, onScanSuccess, parseQRCodeValue, setNativeModalVisible]);

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

  if (!hasPermission) {
    return (
      <ScreenContainer padding={0}>
        <View style={styles.permissionContainer}>
          <SvgIcons.AddCamera width={80} height={80} />
          <CustomText variant="h3" style={styles.permissionTitle}>
            Camera Permission Required
          </CustomText>
          <CustomText style={styles.permissionText}>
            To scan QR codes, PayAiro needs access to your camera.
            {!canAskAgain && " Please enable camera access in your device settings."}
          </CustomText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <CustomText style={styles.permissionButtonText}>
              {canAskAgain ? "Grant Permission" : "Open Settings"}
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!device) {
    return (
      <ScreenContainer padding={0}>
        <View style={styles.errorContainer}>
          <SvgIcons.AddCamera width={80} height={80} />
          <CustomText variant="h3" style={styles.errorTitle}>
            Camera Unavailable
          </CustomText>
          <CustomText style={styles.errorText}>
            No camera device found. Please try again on a physical device.
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      padding={0}
      style={styles.container}
    >
      <View style={styles.topBar}>
        <SvgIcons.ToastCross
          onPress={() => navigation.goBack()}
          width={25}
          height={25}
        />

        <View style={styles.topBarActions}>
          <SvgIcons.ImageIconWhite
            onPress={uploadFromGallery}
            width={25}
            height={25}
          />
          <SvgIcons.TorchIcon
            onPress={toggleTorchMode}
            width={25}
            height={25}
          />
        </View>
      </View>
      <Camera
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
      <QRScannerOverlay
        scanAreaSize={SCAN_AREA_SIZE}
        borderColor={theme.colors.palette.secondary}
        borderWidth={3}
        cornerLength={35}
        cornerRadius={12}
        overlayOpacity={0.65}
        isScanning={isScanning}
      />
    </ScreenContainer>
  );
};

export default QRScanner;
