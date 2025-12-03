import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import React, { useState } from "react";
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
import { ImageLibraryOptions, launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import BottomNavigation from "../../components/BottomNavigation";
import QRModal from "../../components/QRModal";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import { IQRCodeEvent, ScansNavigationProp } from "./types";
import QRCodeScanner from "react-native-qr-decode-image-camera";

const { width, height } = Dimensions.get("window"); // Get device dimensions

export default function Scans(): JSX.Element {
  const { theme } = useTheme();

  const [scanned, setScanned] = useState<boolean>(false);
  const navigation = useNavigation<ScansNavigationProp | any>();
  const [isVisible, setisVisible] = useState<boolean>(false);
  const onQRCodeRead = (event: IQRCodeEvent): void => {
    console.log(
      event.nativeEvent.codeStringValue,
      "event.nativeEvent.codeStringValue"
    );
    setScanned(true);
    navigation.replace(SCREENS.ScanPay, {
      type: event.nativeEvent.codeStringValue?.includes("orderID")
        ? "request"
        : event.nativeEvent.codeStringValue.includes("merchantSend")
        ? "merchantSend"
        : event.nativeEvent.codeStringValue.includes("sending")
        ? "receive"
        : "receiveMerchant",
      sender: event.nativeEvent.codeStringValue?.includes("orderID")
        ? JSON.parse(event.nativeEvent.codeStringValue)
        : event.nativeEvent.codeStringValue?.includes("merchantSend")
        ? JSON.parse(event.nativeEvent.codeStringValue)
        : event.nativeEvent.codeStringValue.replace("sending: ", ""),
    });
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
      if (Platform.OS === 'android' && imagePath.startsWith('file://')) {
        imagePath = imagePath.replace('file://', '');
      }

      try {
        // Scan QR code from the selected image
        console.log("Starting QR decode for image:", imagePath);
        console.log("Original URI:", result.assets[0].uri);
        
        const qrData = await QRCodeScanner.decode(imagePath);
        
        console.log("QR Data received:", qrData);
        console.log("QR Data type:", typeof qrData);
        console.log("QR Data length:", typeof qrData === 'string' ? qrData.length : 'N/A');
        
        // Handle different return formats from the library
        let codeStringValue: string = "";
        
        if (typeof qrData === 'string' && qrData.length > 0) {
          codeStringValue = qrData;
        } else if (typeof qrData === 'object' && qrData !== null) {
          // The library might return an object with values array
          const qrDataObj = qrData as any;
          if (qrDataObj.values && Array.isArray(qrDataObj.values) && qrDataObj.values.length > 0) {
            codeStringValue = qrDataObj.values[0];
          } else if (qrDataObj.data) {
            codeStringValue = qrDataObj.data;
          }
        }
        
        console.log("Extracted code value:", codeStringValue);
        
        if (codeStringValue && codeStringValue.length > 0) {
          console.log("QR Code from Gallery:", codeStringValue);
          console.log("Contains 'sending':", codeStringValue.includes("sending"));
          
          // Validate that it's a PayAiro QR code (contains "sending:")
          if (!codeStringValue.includes("sending:") && 
              !codeStringValue.includes("orderID") && 
              !codeStringValue.includes("merchantSend")) {
            Alert.alert("Invalid QR Code", "Please scan a valid PayAiro QR code.");
            return;
          }
          
          // Process QR code data similar to onQRCodeRead
          setScanned(true);
          navigation.replace(SCREENS.ScanPay, {
            type: codeStringValue?.includes("orderID")
              ? "request"
              : codeStringValue.includes("merchantSend")
              ? "merchantSend"
              : codeStringValue.includes("sending")
              ? "receive"
              : "receiveMerchant",
            sender: codeStringValue?.includes("orderID")
              ? JSON.parse(codeStringValue)
              : codeStringValue?.includes("merchantSend")
              ? JSON.parse(codeStringValue)
              : codeStringValue.replace("sending: ", ""),
          });
        } else {
          console.log("QR data is empty or null");
          Alert.alert("Error", "No QR code found in the image. Please select an image with a valid QR code.");
        }
      } catch (error) {
        console.log("QR Decode Error:", error);
        console.log("Error details:", JSON.stringify(error, null, 2));
        Alert.alert("Error", "No QR code found in the image. Please select an image with a valid QR code.");
      }
    } else {
      Alert.alert("Error", "No image selected.");
    }
  };

  return (
    // <Container >
    <ScreenContainer padding={0}>
      {/* Camera Preview */}
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

      {/* Masking the rest of the screen */}
      <View
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
        <TouchableOpacity
          onPress={() => setisVisible(true)}
          style={{
            paddingBottom: 8,
            padding: 10,
            backgroundColor: theme.colors.palette.green700,
            borderRadius: theme.spacing.spacing[5],
          }}
        >
          <CustomText
            variant="button"
            size={13}
            color={theme.colors.palette.white}
          >
            Show My QR
          </CustomText>
        </TouchableOpacity>
        <CustomText variant="h3">Scan QR Code</CustomText>
        <CustomText style={{ textAlign: "center" }} variant="subtitle1">
          Scan a payment QR code to send or receive money securely.
        </CustomText>
      </View>
      <QRModal isVisible={isVisible} onClose={() => setisVisible(false)} onSelected={() => {}} />
      <View style={{ marginTop: 40 }}>
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
      </View>
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
    width: width * 0.95, // 80% of the screen width
    height: width * 0.95, // Make it square
    alignSelf: "center",
    marginTop: height * 0.2, // Center vertically
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(243, 251, 244, 1)",
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

