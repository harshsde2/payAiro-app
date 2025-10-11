declare module 'react-native-qr-decode-image-camera' {
  interface QRCodeResult {
    values?: string[];
    data?: string;
  }

  export default class QRCodeScanner {
    static decode(imagePath: string): Promise<string | QRCodeResult>;
  }
}

