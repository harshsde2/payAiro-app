import { NavigationProp } from '@react-navigation/native';
import { Code } from 'react-native-vision-camera';

export interface IQRCodeEvent {
  nativeEvent: {
    codeStringValue: string;
  };
}

export interface IScanPayParams {
  type: 'request' | 'merchantSend' | 'receive' | 'receiveMerchant';
  sender: string | object;
}

export type ScansNavigationProp = NavigationProp<any>;

export type QRCodeType = 'request' | 'merchantSend' | 'receive' | 'receiveMerchant';

export interface IProcessedQRCode {
  type: QRCodeType;
  sender: string | object;
}

export interface IQRScannerOverlayProps {
  scanAreaSize?: number;
  borderColor?: string;
  borderWidth?: number;
  cornerLength?: number;
  cornerRadius?: number;
  overlayOpacity?: number;
  isScanning?: boolean;
}

export interface ICameraPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  permissionStatus: 'granted' | 'denied' | 'not-determined' | 'restricted';
  canAskAgain: boolean;
}

export interface IVisionCameraCode extends Code {
  value?: string;
}
