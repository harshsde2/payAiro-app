import Foundation
import UIKit
import Vision
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
        // Run on background queue
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.processImage(imageUri: imageUri, resolve: resolve, reject: reject)
        }
    }
    
    // MARK: - Private Methods
    
    private func processImage(
        imageUri: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Validate URI
        guard !imageUri.isEmpty else {
            reject(ErrorCode.invalidURI.rawValue, "Image URI is empty or blank", nil)
            return
        }
        
        // Clean and parse URI
        let cleanPath = imageUri
            .replacingOccurrences(of: "file://", with: "")
            .removingPercentEncoding ?? imageUri
        
        // Load image
        guard let image = loadImage(from: cleanPath) else {
            reject(ErrorCode.imageLoadFailed.rawValue, "Failed to load image from URI: \(imageUri)", nil)
            return
        }
        
        // Get CGImage for Vision processing
        guard let cgImage = image.cgImage else {
            reject(ErrorCode.imageLoadFailed.rawValue, "Failed to convert image to CGImage", nil)
            return
        }
        
        // Scan QR code
        scanQRCode(from: cgImage, orientation: image.imageOrientation, resolve: resolve, reject: reject)
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
    
    private func scanQRCode(
        from cgImage: CGImage,
        orientation: UIImage.Orientation,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Create barcode detection request
        let request = VNDetectBarcodesRequest { request, error in
            if let error = error {
                reject(ErrorCode.scanFailed.rawValue, "QR scan failed: \(error.localizedDescription)", error)
                return
            }
            
            guard let observations = request.results as? [VNBarcodeObservation] else {
                resolve(nil)
                return
            }
            
            // Find QR code (first match)
            if let qrObservation = observations.first(where: { $0.symbology == .qr }) {
                if let payload = qrObservation.payloadStringValue, !payload.isEmpty {
                    let result: [String: Any] = [
                        "value": payload,
                        "format": "QR_CODE"
                    ]
                    resolve(result)
                } else {
                    // QR code found but no payload
                    resolve(nil)
                }
            } else {
                // No QR code found
                resolve(nil)
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
            reject(ErrorCode.scanFailed.rawValue, "Failed to perform QR scan: \(error.localizedDescription)", error)
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
