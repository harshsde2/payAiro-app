import Foundation
import UIKit
import Vision
import Photos
import React

/**
 * PayAiro QR Scanner Native Module for iOS
 *
 * Production-ready QR code scanner for gallery images.
 * Uses Apple Vision Framework - offline, reliable, native performance.
 *
 * Thread-safe: All heavy operations run on background queues.
 * Error-safe: All exceptions are caught and mapped to descriptive errors.
 */
@objc(PayAiroQRScanner)
class PayAiroQRScannerModule: NSObject {
    
    // MARK: - Error Codes
    private enum ErrorCode: String {
        case invalidURI = "INVALID_URI"
        case imageLoadFailed = "IMAGE_LOAD_FAILED"
        case scanFailed = "SCAN_FAILED"
        case unknownError = "UNKNOWN_ERROR"
    }
    
    // MARK: - Module Setup
    
    @objc
    static func moduleName() -> String {
        return "PayAiroQRScanner"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // MARK: - Public API
    
    /**
     * Scans QR code from an image file
     *
     * - Parameter imageUri: Local image URI (file:// path)
     * - Parameter resolve: React Native promise resolver
     * - Parameter reject: React Native promise rejecter
     */
    @objc
    func scanQRCodeFromImage(
        _ imageUri: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        NSLog("[PayAiroQRScanner] scanQRCodeFromImage called")
        NSLog("[PayAiroQRScanner] Incoming imageUri: %@", imageUri)
        // Run on background queue
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            let promiseGuard = PromiseGuard()
            self?.processImage(
                imageUri: imageUri,
                resolve: resolve,
                reject: reject,
                promiseGuard: promiseGuard
            )
        }
    }
    
    // MARK: - Private Methods
    
    private final class PromiseGuard {
        required init() {}
        
        private var isSettled = false
        private let lock = NSLock()
        
        func settle(_ block: () -> Void) {
            lock.lock()
            defer { lock.unlock() }
            guard !isSettled else { return }
            isSettled = true
            block()
        }
    }
    
    private func processImage(
        imageUri: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock,
        promiseGuard: PromiseGuard
    ) {
        NSLog("[PayAiroQRScanner] processImage start")
        // Validate URI
        guard !imageUri.isEmpty else {
            NSLog("[PayAiroQRScanner] Invalid URI: empty string")
            promiseGuard.settle {
                reject(ErrorCode.invalidURI.rawValue, "Image URI is empty or blank", nil)
            }
            return
        }
        
        // Handle Photos framework asset URI (ph://)
        if imageUri.lowercased().hasPrefix("ph://") {
            NSLog("[PayAiroQRScanner] Detected Photos URI (ph://)")
            loadImageFromPhotos(
                assetUri: imageUri,
                resolve: resolve,
                reject: reject,
                promiseGuard: promiseGuard
            )
            return
        }
        
        // Clean and parse URI
        let cleanPath = imageUri
            .replacingOccurrences(of: "file://", with: "")
            .removingPercentEncoding ?? imageUri
        
        // Load image
        guard let image = loadImage(from: cleanPath) else {
            NSLog("[PayAiroQRScanner] Failed to load image from path: %@", cleanPath)
            promiseGuard.settle {
                reject(ErrorCode.imageLoadFailed.rawValue, "Failed to load image from URI: \(imageUri)", nil)
            }
            return
        }
        NSLog("[PayAiroQRScanner] Image loaded successfully")
        
        let preparedImage = prepareImageForVision(image)
        NSLog(
            "[PayAiroQRScanner] Prepared image size: %.0fx%.0f",
            preparedImage.size.width,
            preparedImage.size.height
        )
        
        // Get CGImage for Vision processing
        guard let cgImage = preparedImage.cgImage else {
            NSLog("[PayAiroQRScanner] Failed to convert UIImage to CGImage")
            promiseGuard.settle {
                reject(ErrorCode.imageLoadFailed.rawValue, "Failed to convert image to CGImage", nil)
            }
            return
        }
        NSLog("[PayAiroQRScanner] CGImage ready, starting scan")
        
        // Scan QR code
        scanQRCode(
            from: cgImage,
            orientation: preparedImage.imageOrientation,
            resolve: resolve,
            reject: reject,
            promiseGuard: promiseGuard
        )
    }
    
    private func loadImage(from path: String) -> UIImage? {
        // Try loading directly from path
        if let image = UIImage(contentsOfFile: path) {
            return image
        }
        
        // Try loading from URL
        if let url = URL(string: path), let data = try? Data(contentsOf: url) {
            return UIImage(data: data)
        }
        
        // Try as file URL
        let fileURL = URL(fileURLWithPath: path)
        if let data = try? Data(contentsOf: fileURL) {
            return UIImage(data: data)
        }
        
        return nil
    }
    
    private func loadImageFromPhotos(
        assetUri: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock,
        promiseGuard: PromiseGuard
    ) {
        NSLog("[PayAiroQRScanner] loadImageFromPhotos start")
        let cleanId = assetUri.replacingOccurrences(of: "ph://", with: "")
        NSLog("[PayAiroQRScanner] Photos asset id: %@", cleanId)
        let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [cleanId], options: nil)
        
        guard let asset = fetchResult.firstObject else {
            NSLog("[PayAiroQRScanner] PHAsset not found for id: %@", cleanId)
            promiseGuard.settle {
                reject(ErrorCode.imageLoadFailed.rawValue, "Failed to fetch PHAsset for URI: \(assetUri)", nil)
            }
            return
        }
        
        let options = PHImageRequestOptions()
        options.isSynchronous = false
        options.deliveryMode = .highQualityFormat
        options.resizeMode = .none
        options.isNetworkAccessAllowed = true
        
        PHImageManager.default().requestImageDataAndOrientation(for: asset, options: options) { data, _, _, info in
            if let info = info, info[PHImageErrorKey] != nil {
                NSLog("[PayAiroQRScanner] PHImage request error: %@", String(describing: info))
                promiseGuard.settle {
                    reject(ErrorCode.imageLoadFailed.rawValue, "Failed to load image data from Photos asset", nil)
                }
                return
            }
            
            guard let data = data, let image = UIImage(data: data) else {
                NSLog("[PayAiroQRScanner] Failed to decode image data from PHAsset")
                promiseGuard.settle {
                    reject(ErrorCode.imageLoadFailed.rawValue, "Failed to decode image data from Photos asset", nil)
                }
                return
            }
            NSLog("[PayAiroQRScanner] Photos image decoded successfully")
            
            let preparedImage = self.prepareImageForVision(image)
            NSLog(
                "[PayAiroQRScanner] Prepared photos image size: %.0fx%.0f",
                preparedImage.size.width,
                preparedImage.size.height
            )
            
            guard let cgImage = preparedImage.cgImage else {
                NSLog("[PayAiroQRScanner] Failed to convert Photos UIImage to CGImage")
                promiseGuard.settle {
                    reject(ErrorCode.imageLoadFailed.rawValue, "Failed to convert Photos image to CGImage", nil)
                }
                return
            }
            NSLog("[PayAiroQRScanner] Photos CGImage ready, starting scan")
            
            self.scanQRCode(
                from: cgImage,
                orientation: preparedImage.imageOrientation,
                resolve: resolve,
                reject: reject,
                promiseGuard: promiseGuard
            )
        }
    }

    private func prepareImageForVision(_ image: UIImage) -> UIImage {
        let maxDimension: CGFloat = 1600
        let size = image.size
        let largestSide = max(size.width, size.height)
        
        let scale = largestSide > maxDimension ? maxDimension / largestSide : 1.0
        let targetSize = CGSize(width: size.width * scale, height: size.height * scale)
        
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        
        let renderer = UIGraphicsImageRenderer(size: targetSize, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: targetSize))
        }
    }
    
    private func scanQRCode(
        from cgImage: CGImage,
        orientation: UIImage.Orientation,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock,
        promiseGuard: PromiseGuard
    ) {
        NSLog("[PayAiroQRScanner] scanQRCode invoked")
        // Create barcode detection request
        let request = VNDetectBarcodesRequest { request, error in
            if let error = error {
                NSLog("[PayAiroQRScanner] Vision error: %@", error.localizedDescription)
                promiseGuard.settle {
                    reject(ErrorCode.scanFailed.rawValue, "QR scan failed: \(error.localizedDescription)", error)
                }
                return
            }
            
            guard let observations = request.results as? [VNBarcodeObservation] else {
                NSLog("[PayAiroQRScanner] Vision results empty or invalid")
                promiseGuard.settle {
                    resolve(nil)
                }
                return
            }
            
            // Find QR code (first match)
            if let qrObservation = observations.first(where: { $0.symbology == .qr }) {
                if let payload = qrObservation.payloadStringValue, !payload.isEmpty {
                    NSLog("[PayAiroQRScanner] QR payload found")
                    let result: [String: Any] = [
                        "value": payload,
                        "format": "QR_CODE"
                    ]
                    promiseGuard.settle {
                        resolve(result)
                    }
                } else {
                    NSLog("[PayAiroQRScanner] QR found but payload empty")
                    // QR code found but no payload
                    promiseGuard.settle {
                        resolve(nil)
                    }
                }
            } else {
                NSLog("[PayAiroQRScanner] No QR code found in image")
                // No QR code found
                promiseGuard.settle {
                    resolve(nil)
                }
            }
        }
        
        // Configure to only detect QR codes for performance
        request.symbologies = [.qr]
        
        // Map UIImage orientation to CGImagePropertyOrientation
        let cgOrientation = cgImageOrientation(from: orientation)
        
        // Create request handler and perform detection
        let handler = VNImageRequestHandler(
            cgImage: cgImage,
            orientation: cgOrientation,
            options: [:]
        )
        
        do {
            try handler.perform([request])
        } catch {
            NSLog("[PayAiroQRScanner] Vision handler perform failed: %@", error.localizedDescription)
            promiseGuard.settle {
                reject(ErrorCode.scanFailed.rawValue, "Failed to perform QR scan: \(error.localizedDescription)", error)
            }
        }
    }
    
    /// Converts UIImage.Orientation to CGImagePropertyOrientation for Vision framework
    private func cgImageOrientation(from uiOrientation: UIImage.Orientation) -> CGImagePropertyOrientation {
        switch uiOrientation {
        case .up:
            return .up
        case .down:
            return .down
        case .left:
            return .left
        case .right:
            return .right
        case .upMirrored:
            return .upMirrored
        case .downMirrored:
            return .downMirrored
        case .leftMirrored:
            return .leftMirrored
        case .rightMirrored:
            return .rightMirrored
        @unknown default:
            return .up
        }
    }
}
