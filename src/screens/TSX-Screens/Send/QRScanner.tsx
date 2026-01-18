import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import React, { useState, useRef } from "react";
import { Theme, useTheme } from "styles";
import { useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IQRCodeEvent } from "screens/Scans/types";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import { launchImageLibrary } from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker";
import QRCodeScanner from "react-native-qrcode-scanner";

const { width, height } = Dimensions.get("window"); // Get device dimensions

const QRScanner = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const { onScanSuccess } = route.params as any;
  const navigation = useNavigation<any>();

  const styles = qrScannerStyles(theme);

  const [scanned, setScanned] = useState<boolean>(false);
  const [torchMode, setTorchMode] = useState<"on" | "off">("off");
  const isProcessingRef = useRef<boolean>(false);

  const parseQRCodeValue = (value: string): string | null => {
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
  };

  const onQRCodeRead = (event: IQRCodeEvent): void => {
    // Prevent multiple scans using ref for synchronous check
    if (isProcessingRef.current || scanned) {
      return;
    }
    
    // Mark as processing immediately (synchronous)
    isProcessingRef.current = true;
    
    const scannedValue = event.nativeEvent.codeStringValue;
    const parsedValue = parseQRCodeValue(scannedValue);
    
    if (parsedValue === null) {
      // Invalid QR code format - reject it and allow retry
      isProcessingRef.current = false;
      return;
    }
    
    setScanned(true);
    
    // Call the callback with parsed value
    if (onScanSuccess) {
      onScanSuccess(parsedValue);
    }
    
    navigation.goBack();
  };




  const toggleTorchMode = (): void => {
    const newMode = torchMode === "off" ? "on" : "off";
    console.log("Toggling torch mode to:", newMode);
    setTorchMode(newMode);
  };

  return (
    <ScreenContainer
      padding={0}
      style={[{ flex: 1 }]}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          position: "absolute",
          top: 0,
          zIndex: 1000,
          flexDirection: "row",
          width: "100%",
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <SvgIcons.ToastCross
          onPress={() => navigation.goBack()}
          width={25}
          height={25}
        />

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "row",
            gap: 20,
          }}
        >
          {/* <SvgIcons.CrossIcon
            onPress={() => navigation.goBack()}
            width={25}
            height={25}
          /> */}
          
          <SvgIcons.TorchIcon
            onPress={toggleTorchMode}
            width={25}
            height={25}
          />
          {/* <SvgIcons.QRCodeWhite
            onPress={() => navigation.navigate(NAVIGATION_SCREENS.RECEIVE)}
            width={30}
            height={30}
          /> */}
        </View>
      </View>
        {/* <View style={[{ flex: 1 }]}> */}
          <Camera
            style={styles.camera} // Limit camera feed size
            scanBarcode={true}
            onReadCode={onQRCodeRead} // Callback when a QR code is scanned
            showFrame={true} // Show frame for QR scanning
            laserColor="red"
            frameColor="rgba(243, 251, 244, 1)"
            zoomMode="on"
            zoom={2}
            cameraType={CameraType.Back}
            torchMode={torchMode}
            flashMode="auto"
          />
        {/* </View> */}
    </ScreenContainer>
  );
};

export default QRScanner;

const qrScannerStyles = (theme: Theme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.overlay,
      paddingTop: theme.spacing.spacing[32],
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopLeftRadius: theme.spacing.spacing.lg,
      borderTopRightRadius: theme.spacing.spacing.lg,
      paddingHorizontal: theme.spacing.spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
    },
    closeButton: {
      padding: theme.spacing.spacing.xs,
    },
    tabContainer: {
      paddingVertical: theme.spacing.spacing.md,
    },
    listContainer: {
      flex: 1,
    },
    camera: {
      width: width , // 80% of the screen width
      height: height, // Make it square
      alignSelf: "center",
    },
  });
