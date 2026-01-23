import { NativeModules, Platform } from "react-native";

const { PayAiroQRScanner: NativeModule } = NativeModules;

/**
 * QR Code scan result
 */
export interface QRCodeScanResult {
  /** The decoded QR code value */
  value: string;
  /** The barcode format (always "QR_CODE" for this scanner) */
  format: "QR_CODE";
}

/**
 * Error codes returned by the native module
 */
export enum QRScannerErrorCode {
  INVALID_URI = "INVALID_URI",
  IMAGE_LOAD_FAILED = "IMAGE_LOAD_FAILED",
  CORRUPTED_QR = "CORRUPTED_QR",
  INVALID_FORMAT = "INVALID_FORMAT",
  SCAN_FAILED = "SCAN_FAILED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  MODULE_NOT_AVAILABLE = "MODULE_NOT_AVAILABLE",
}

/**
 * Error thrown by QR scanner
 */
export class QRScannerError extends Error {
  public readonly code: QRScannerErrorCode;

  constructor(code: QRScannerErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "QRScannerError";
  }
}

/**
 * PayAiro QR Scanner
 *
 * Production-ready, cross-platform QR code scanner for gallery images.
 *
 * Platform Implementation:
 * - Android: ZXing (offline, reliable)
 * - iOS: Apple Vision Framework (native, performant)
 *
 * Features:
 * - No camera permission required
 * - Works completely offline
 * - Handles image rotation (EXIF)
 * - Thread-safe (background processing)
 * - Error-safe (no crashes)
 *
 * @example
 * ```typescript
 * import { PayAiroQRScanner } from 'utils/PayAiroQRScanner';
 *
 * try {
 *   const result = await PayAiroQRScanner.scanQRCodeFromImage(imageUri);
 *   if (result) {
 *     console.log('QR Code:', result.value);
 *   } else {
 *     console.log('No QR code found');
 *   }
 * } catch (error) {
 *   if (error instanceof QRScannerError) {
 *     console.error('Scan failed:', error.code, error.message);
 *   }
 * }
 * ```
 */
class PayAiroQRScannerClass {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = NativeModule != null;
    
    if (!this.isAvailable) {
      console.warn(
        "[PayAiroQRScanner] Native module not available. " +
        "Ensure the app is rebuilt after adding the native module."
      );
    }
  }

  /**
   * Scans a QR code from an image file
   *
   * @param imageUri - Local image URI (from gallery picker)
   *                   Supported formats: file://, content:// (Android), absolute path
   * @returns Promise that resolves to QRCodeScanResult if QR found, null otherwise
   * @throws QRScannerError if scanning fails
   *
   * @example
   * ```typescript
   * // Using with react-native-image-crop-picker
   * const image = await ImagePicker.openPicker({ mediaType: 'photo' });
   * const result = await PayAiroQRScanner.scanQRCodeFromImage(image.path);
   * ```
   */
  async scanQRCodeFromImage(imageUri: string): Promise<QRCodeScanResult | null> {
    // Validate module availability
    if (!this.isAvailable) {
      throw new QRScannerError(
        QRScannerErrorCode.MODULE_NOT_AVAILABLE,
        "PayAiroQRScanner native module is not available. Rebuild the app."
      );
    }

    // Validate input
    if (!imageUri || typeof imageUri !== "string" || imageUri.trim() === "") {
      throw new QRScannerError(
        QRScannerErrorCode.INVALID_URI,
        "Image URI is required and must be a non-empty string"
      );
    }

    try {
      const result = await NativeModule.scanQRCodeFromImage(imageUri);
      
      // Native module returns null if no QR code found
      if (result === null || result === undefined) {
        return null;
      }

      // Validate result structure
      if (typeof result === "object" && result.value && result.format) {
        return {
          value: String(result.value),
          format: "QR_CODE",
        };
      }

      return null;
    } catch (error: unknown) {
      // Handle native module errors
      if (error instanceof Error) {
        const nativeError = error as { code?: string; message?: string };
        const code = (nativeError.code as QRScannerErrorCode) || QRScannerErrorCode.UNKNOWN_ERROR;
        const message = nativeError.message || "Unknown error during QR scan";
        
        throw new QRScannerError(code, message);
      }

      throw new QRScannerError(
        QRScannerErrorCode.UNKNOWN_ERROR,
        "Unexpected error during QR scan"
      );
    }
  }

  /**
   * Checks if the native module is available
   *
   * @returns true if the native module is loaded and ready
   */
  isModuleAvailable(): boolean {
    return this.isAvailable;
  }
}

/**
 * Singleton instance of PayAiro QR Scanner
 */
export const PayAiroQRScanner = new PayAiroQRScannerClass();

export default PayAiroQRScanner;
