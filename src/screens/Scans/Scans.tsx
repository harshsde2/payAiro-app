import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import React, { useState, useRef } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from "react-native-image-picker";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import BottomNavigation from "../../components/BottomNavigation";
import QRModal from "../../components/QRModal";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import { IQRCodeEvent, ScansNavigationProp } from "./types";
import QRCodeScanner from "react-native-qr-decode-image-camera";
import GenericButton from "components/GenericButton";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window"); // Get device dimensions

/**
 * Processes QR code string or object and determines the type and sender
 * @param codeStringValue - The QR code value (can be string or parsed object)
 * @returns Object containing type and sender based on QR code content
 */
const processQRCodeData = (
  codeStringValue: string | object | null | undefined
): {
  type: "request" | "merchantSend" | "receive" | "receiveMerchant";
  sender: string | object;
} => {
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
      orderID?: any;
      merchantSend?: any;
      [key: string]: any;
    };

    // Extract username as sender if available, otherwise use the full object
    const sender = qrObject.username ? qrObject.username : qrObject;

    // If object has a type field, use it directly
    if (qrObject.type) {
      const validTypes: Array<
        "request" | "merchantSend" | "receive" | "receiveMerchant"
      > = ["request", "merchantSend", "receive", "receiveMerchant"];

      const type = validTypes.includes(qrObject.type as any)
        ? (qrObject.type as
            | "request"
            | "merchantSend"
            | "receive"
            | "receiveMerchant")
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

export default function Scans(): JSX.Element {
  const { theme } = useTheme();
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);
  const [scanned, setScanned] = useState<boolean>(false);
  const navigation = useNavigation<ScansNavigationProp | any>();
  const [isVisible, setisVisible] = useState<boolean>(false);
  const [torchMode, setTorchMode] = useState<"on" | "off">("off");
  const cameraRef = useRef<any>(null);
  const onQRCodeRead = (event: IQRCodeEvent): void => {
    console.log(
      event.nativeEvent.codeStringValue,
      "event.nativeEvent.codeStringValue"
    );
    setScanned(true);

    // Try to parse as JSON, if it fails, pass as string
    let parsedValue: string | object;
    try {
      parsedValue = JSON.parse(event.nativeEvent.codeStringValue);
    } catch {
      parsedValue = event.nativeEvent.codeStringValue;
    }

    const { type, sender } = processQRCodeData(parsedValue);

    if (type === "receiveMerchant") {
      navigation.replace(NAVIGATION_SCREENS.SEND, {
        requested: false,
        sender,
      });
    } else {
      navigation.replace(NAVIGATION_SCREENS.SCAN_PAY, {
        type,
        sender,
      });
    }
  };

  const toggleTorchMode = (): void => {
    const newMode = torchMode === "off" ? "on" : "off";
    console.log("Toggling torch mode to:", newMode);
    setTorchMode(newMode);
  };

  const uploadFromGallery = async (): Promise<void> => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
    };

    const result = await launchImageLibrary(options);

    if (result.assets && result.assets[0]) {
      let imagePath = result.assets[0].uri;

      if (!imagePath) {
        Alert.alert("Error", "Unable to access the selected image.");
        return;
      }

      // Convert URI for Android if needed (remove file:// prefix for the library)
      if (Platform.OS === "android" && imagePath.startsWith("file://")) {
        imagePath = imagePath.replace("file://", "");
      }

      try {
        // Scan QR code from the selected image
        console.log("Starting QR decode for image:", imagePath);
        console.log("Original URI:", result.assets[0].uri);

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
          const qrDataObj = qrData as any;
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
              return;
            }
          }

          // Process QR code data using the helper function
          setScanned(true);
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
      }
    } else {
      Alert.alert("Error", "No image selected.");
    }
  };

  return (
    // <Container >
    <ScreenContainer padding={0}>
      {/* Camera Preview */}
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
        {/* <SvgIcons. width={30} height={30} /> */}

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "row",
            gap: 20,
          }}
        >
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
      <Camera
        ref={cameraRef}
        style={styles.camera} // Limit camera feed size
        scanBarcode={true}
        onReadCode={onQRCodeRead} // Callback when a QR code is scanned
        showFrame={true} // Show frame for QR scanning
        laserColor="red"
        frameColor="rgba(243, 251, 244, 1)"
        zoomMode="on"
        zoom={2}
        torchMode={torchMode}
        flashMode="auto"
        cameraType={CameraType.Back}
      />

      {/* Masking the rest of the screen */}
      {/* <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          paddingVertical: 10,
        }}
      >
        <CustomText variant="h3">Scan QR Code</CustomText>
        <CustomText style={{ textAlign: "center" }} >
          Scan a payment QR code to send money securely.
        </CustomText>
      </View> */}
      <QRModal
        isVisible={isVisible}
        onClose={() => setisVisible(false)}
        onSelected={() => {}}
      />
      {/* <View style={{ marginTop: 40 }}>
        <TouchableOpacity
          onPress={uploadFromGallery}
          style={{
            padding: 15,
            alignSelf: "center",
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderRadius: 30,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            // marginTop: -130,
          }}
        >
            <SvgIcons.ImageIcon />
          <Text style={{ color: "#000", fontFamily: Fonts.bold }}>
             Upload from Gallery
          </Text>
        </TouchableOpacity>
      </View> */}
      {/* <View style={{ marginTop: 20,paddingHorizontal: 20, alignItems: "center", justifyContent: "center" }}>
      <GenericButton
        title="Show My QR Code"
        onPress={() => {
            navigation.navigate(NAVIGATION_SCREENS.RECEIVE);
          }}
        />
      </View> */}
      {/* <View style={[styles.overlay, styles.leftOverlay]} /> */}
      {/* <View style={[styles.overlay, styles.rightOverlay]} /> */}
      <BottomNavigation isVer={false} />
    </ScreenContainer>
    // </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(243, 251, 244, 1)",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 60,
    // position: 'absolute',
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.semibold,
    width: "70%",
    alignSelf: "center",
  },
  camera: {
    width: width, // 80% of the screen width
    height: Platform.OS === "ios" ? height * 0.85 : height * 0.95, // Make it square
    alignSelf: "center",
    // marginTop: height * 0.2, // Center vertically
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgb(251, 246, 243)",
    opacity: 0.8, // Slight transparency if desired
    top: 20,
  },
  topOverlay: {
    top: 20,
    left: 0,
    right: 0,
    // bottom: 20,
    height: height * 0.2, // Top black area\
  },
  bottomOverlay: {
    // marginTop: 30,
    bottom: 80,
    left: 0,
    right: 0,
    height: height * 0, // Bottom black area
  },
  leftOverlay: {
    top: height * 0.1, // Start from below the top overlay
    bottom: height * 0.1, // End above the bottom overlay
    left: 0,
    width: width * 0.1, // Left black area
  },
  rightOverlay: {
    top: height * 0.1,
    bottom: height * 0.2,
    right: 0,
    width: width * 0.1, // Right black area
  },
});
