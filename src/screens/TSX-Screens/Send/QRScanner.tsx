import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import React, { useState, useRef } from "react";
import { Theme, useTheme } from "styles";
import { useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IQRCodeEvent } from "screens/Scans/types";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const { width, height } = Dimensions.get("window"); // Get device dimensions

const QRScanner = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const { onScanSuccess } = route.params as any;
  const navigation = useNavigation<any>();

  const styles = qrScannerStyles(theme);

  const [scanned, setScanned] = useState<boolean>(false);
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

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={[styles.mainContainer]}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={[styles.container]}
      >
        {/* Header */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.header}
        >
          <View
            style={[
              {
                height: 5,
                backgroundColor: "black",
                width: 80,
                borderRadius: theme.spacing.spacing[1],
              },
            ]}
          />
        </TouchableOpacity>
        <View style={[styles.listContainer]}>
          <Camera
            style={styles.camera} // Limit camera feed size
            scanBarcode={true}
            onReadCode={onQRCodeRead} // Callback when a QR code is scanned
            showFrame={false} // Show frame for QR scanning
            laserColor="red"
            frameColor="rgba(243, 251, 244, 1)"
            zoomMode="on"
            zoom={2}
            cameraType={CameraType.Back}
          />
        </View>
      </Pressable>
    </Pressable>
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
      width: width * 0.8, // 80% of the screen width
      height: width * 0.8, // Make it square
      alignSelf: "center",
      marginTop: height * 0.2, // Center vertically
    },
  });
