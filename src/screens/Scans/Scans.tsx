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
import QRModal from "../../components/QRModal";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import { IProcessedQRCode, QRCodeType } from "./types";
import QRCodeScanner from "react-native-qr-decode-image-camera";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useSelector } from "react-redux";
import { useAppLock } from "hooks/useAppLock";
import { useCameraPermission } from "hooks/useCameraPermission";
import QRScannerOverlay from "./QRScannerOverlay";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width, height } = Dimensions.get("window");

// Scan area size for region of interest (iOS optimization)
const SCAN_AREA_SIZE = width * 0.7;

/**
 * Processes QR code string or object and determines the type and sender
 * @param codeStringValue - The QR code value (can be string or parsed object)
 * @returns Object containing type and sender based on QR code content
 */
const processQRCodeData = (
  codeStringValue: string | object | null | undefined
): IProcessedQRCode => {
  console.log(
    "codeStringValue ->",
    JSON.stringify(codeStringValue ?? "{}", null, 2)
  );

  if (!codeStringValue) {
    return {
      type: "receiveMerchant",
      sender: "",
    };
  }

  // Handle object format: { "type": "receive", "username": "pratap", "tag": "pratap" }
  if (typeof codeStringValue === "object" && codeStringValue !== null) {
    const qrObject = codeStringValue as {
      type?: string;
      username?: string;
      orderID?: unknown;
      merchantSend?: unknown;
      [key: string]: unknown;
    };

    // Extract username as sender if available, otherwise use the full object
    const sender = qrObject.username ? qrObject.username : qrObject;

    // If object has a type field, use it directly
    if (qrObject.type) {
      const validTypes: QRCodeType[] = ["request", "merchantSend", "receive", "receiveMerchant"];

      const type = validTypes.includes(qrObject.type as QRCodeType)
        ? (qrObject.type as QRCodeType)
        : "receiveMerchant";

      return {
        type,
        sender,
      };
    }

    // If object doesn't have type but has orderID, it's a request
    if ("orderID" in qrObject || qrObject.orderID) {
      return {
        type: "request",
        sender,
      };
    }

    // If object has merchantSend, it's merchantSend
    if ("merchantSend" in qrObject || qrObject.merchantSend) {
      return {
        type: "merchantSend",
        sender,
      };
    }

    // Default for object without type field
    return {
      type: "receiveMerchant",
      sender,
    };
  }

  // Handle string format (legacy support)
  const codeString = codeStringValue as string;

  // Check conditions in priority order
  if (codeString.includes("orderID")) {
    try {
      return {
        type: "request",
        sender: JSON.parse(codeString),
      };
    } catch {
      return {
        type: "request",
        sender: codeString,
      };
    }
  }

  if (codeString.includes("merchantSend")) {
    try {
      return {
        type: "merchantSend",
        sender: JSON.parse(codeString),
      };
    } catch {
      return {
        type: "merchantSend",
        sender: codeString,
      };
    }
  }

  if (codeString.includes("sending")) {
    return {
      type: "receive",
      sender: codeString.replace("sending: ", ""),
    };
  }

  // Default case
  return {
    type: "receiveMerchant",
    sender: codeString.replace("sending: ", ""),
  };
};

export default function Scans(): React.ReactElement {
  const { theme } = useTheme();
  const { isCrypto } = useSelector((state: unknown) => (state as { authenticationSlice: { isCrypto: boolean } }).authenticationSlice);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isVisible, setisVisible] = useState<boolean>(false);
  const [torchMode, setTorchMode] = useState<"on" | "off">("off");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const cameraRef = useRef<Camera>(null);
  const isProcessingRef = useRef<boolean>(false);
  
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

  // Handle QR code detection from camera
  const handleQRCodeScanned = useCallback((codes: Code[]): void => {
    // Prevent multiple rapid scans
    if (isProcessingRef.current || codes.length === 0) {
      return;
    }

    const code = codes[0];
    const codeValue = code.value;

    if (!codeValue || codeValue.length === 0) {
      return;
    }

    console.log("QR Code scanned:", codeValue);
    
    // Set processing flag to prevent duplicate navigation
    isProcessingRef.current = true;
    setIsScanning(false);

    // Try to parse as JSON, if it fails, pass as string
    let parsedValue: string | object;
    try {
      parsedValue = JSON.parse(codeValue);
    } catch {
      parsedValue = codeValue;
    }

    const { type, sender } = processQRCodeData(parsedValue);

    if (type === "receiveMerchant") {
      navigation.navigate(NAVIGATION_SCREENS.SEND, {
        requested: false,
        sender,
      });
    } else {
      navigation.navigate(NAVIGATION_SCREENS.SCAN_PAY, {
        type,
        sender,
      });
    }
  }, [navigation]);

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

      let imagePath = pickedImage.uri;

      // Convert URI for Android if needed (remove file:// prefix for the library)
      if (Platform.OS === "android" && imagePath.startsWith("file://")) {
        imagePath = imagePath.replace("file://", "");
      }

      try {
        // Scan QR code from the selected image
        console.log("Starting QR decode for image:", imagePath);
        console.log("Original URI:", pickedImage.uri);

        const qrData = await QRCodeScanner.decode(imagePath);

        console.log("QR Data received:", qrData);
        console.log("QR Data type:", typeof qrData);
        console.log(
          "QR Data length:",
          typeof qrData === "string" ? qrData.length : "N/A"
        );

        // Handle different return formats from the library
        let codeStringValue: string = "";

        if (typeof qrData === "string" && qrData.length > 0) {
          codeStringValue = qrData;
        } else if (typeof qrData === "object" && qrData !== null) {
          // The library might return an object with values array
          const qrDataObj = qrData as { values?: string[]; data?: string };
          if (
            qrDataObj.values &&
            Array.isArray(qrDataObj.values) &&
            qrDataObj.values.length > 0
          ) {
            codeStringValue = qrDataObj.values[0];
          } else if (qrDataObj.data) {
            codeStringValue = qrDataObj.data;
          }
        }

        console.log("Extracted code value:", codeStringValue);

        if (codeStringValue && codeStringValue.length > 0) {
          console.log("QR Code from Gallery:", codeStringValue);

          // Try to parse as JSON, if it fails, validate as string
          let parsedValue: string | object;
          try {
            parsedValue = JSON.parse(codeStringValue);
            console.log("Parsed QR code as object:", parsedValue);
          } catch {
            parsedValue = codeStringValue;
            console.log("QR code is string format");

            // Validate that it's a PayAiro QR code (contains "sending:", "orderID", or "merchantSend")
            if (
              !codeStringValue.includes("sending:") &&
              !codeStringValue.includes("orderID") &&
              !codeStringValue.includes("merchantSend")
            ) {
              Alert.alert(
                "Invalid QR Code",
                "Please scan a valid PayAiro QR code."
              );
              setNativeModalVisible(false);
              return;
            }
          }

          // Process QR code data using the helper function
          setIsScanning(false);
          const { type, sender } = processQRCodeData(parsedValue);

          navigation.replace(SCREENS.ScanPay, {
            type,
            sender,
          });
        } else {
          console.log("QR data is empty or null");
          Alert.alert(
            "Error",
            "No QR code found in the image. Please select an image with a valid QR code."
          );
        }
      } catch (error) {
        console.log("QR Decode Error:", error);
        console.log("Error details:", JSON.stringify(error, null, 2));
        Alert.alert(
          "Error",
          "No QR code found in the image. Please select an image with a valid QR code."
        );
      } finally {
        setTimeout(() => setNativeModalVisible(false), 1000);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Unable to access the selected image.");
      setNativeModalVisible(false);
    }
  }, [navigation, setNativeModalVisible]);

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
            onPress={() => navigation.navigate(NAVIGATION_SCREENS.RECEIVE)}
            activeOpacity={0.8}
          >
            <CustomText style={styles.secondaryButtonText}>
              Show My QR Code
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={0}>
      {/* Top action bar */}
      <View style={styles.topBar}>
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
          <SvgIcons.QRCodeWhite
            onPress={() => navigation.navigate(NAVIGATION_SCREENS.RECEIVE)}
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
