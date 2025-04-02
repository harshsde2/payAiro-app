import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import Container from '../../HOC/Container';
import BottomNavigation from '../../components/BottomNavigation';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {SVGPhoto} from '../../constants/images';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import {launchImageLibrary} from 'react-native-image-picker';
import QRModal from '../../components/QRModal';

const {width, height} = Dimensions.get('window'); // Get device dimensions

export default function Scans() {
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const [isVisible, setisVisible] = useState(false);
  const onQRCodeRead = event => {
    console.log(
      event.nativeEvent.codeStringValue,
      'event.nativeEvent.codeStringValue',
    );
    setScanned(true);
    navigation.navigate(SCREENS.ScanPay, {
      type: event.nativeEvent.codeStringValue?.includes('orderID')
        ? 'request'
        : event.nativeEvent.codeStringValue.includes('merchantSend')
        ? 'merchantSend'
        : event.nativeEvent.codeStringValue.includes('sending')
        ? 'receive'
        : 'receiveMerchent',
      sender: event.nativeEvent.codeStringValue?.includes('orderID')
        ? JSON.parse(event.nativeEvent.codeStringValue)
        : event.nativeEvent.codeStringValue?.includes('merchantSend')
        ? JSON.parse(event.nativeEvent.codeStringValue)
        : event.nativeEvent.codeStringValue.replace('sending', ''),
    });
  };

  const uploadFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
    });

    if (result.assets && result.assets[0]) {
      const imagePath = result.assets[0].uri;

      try {
        // Scan QR code from the selected image
        Alert.alert('QR Code Scanned from Image', qrCodeData);
      } catch (error) {
        Alert.alert('Error', 'No QR code found in the image.');
      }
    } else {
      Alert.alert('Error', 'No image selected.');
    }
  };

  return (
    // <Container >
    <View style={styles.container}>
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
      />

      {/* Masking the rest of the screen */}
      <View style={{position: 'absolute', top: -50}}>
        <TouchableOpacity
          onPress={() => setisVisible(true)}
          style={{
            paddingBottom: 8,
            paddingTop: 5,
            width: '30%',
            alignSelf: 'flex-end',
            backgroundColor: '#B1FF84',
            borderRadius: 10,
            marginTop: 10,
            marginRight: 10,
          }}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              fontFamily: Fonts.semibold,
              color: 'black',
            }}>
            Show My QR
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Scan the booking QR code or upload one from your gallery.
        </Text>
      </View>
      <QRModal isVisible={isVisible} onClose={() => setisVisible(false)} />
      <View style={{marginTop: 40}}>
        <TouchableOpacity
          onPress={uploadFromGallery}
          style={{
            padding: 15,
            alignSelf: 'center',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            borderRadius: 30,
            // marginTop: -130,
          }}>
          <Text style={{color: '#000', fontFamily: Fonts.bold}}>
            <SvgXml xml={SVGPhoto} /> Upload from Galery
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.overlay, styles.leftOverlay]} />
      <View style={[styles.overlay, styles.rightOverlay]} />
      <BottomNavigation />
    </View>
    // </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(243, 251, 244, 1)',
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 60,
    // position: 'absolute',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Fonts.semibold,
    width: '70%',
    alignSelf: 'center',
  },
  camera: {
    width: width * 0.8, // 80% of the screen width
    height: width * 0.8, // Make it square
    alignSelf: 'center',
    marginTop: height * 0.2, // Center vertically
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(243, 251, 244, 1)',
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
