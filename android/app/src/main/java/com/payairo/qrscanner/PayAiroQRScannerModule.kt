package com.payairo.qrscanner

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.*
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import kotlinx.coroutines.*
import java.io.InputStream

/**
 * PayAiro QR Scanner Native Module
 * 
 * Production-ready QR code scanner for gallery images.
 * Uses ZXing for decoding - offline, reliable, no external dependencies.
 * 
 * Thread-safe: All heavy operations run on background threads.
 * Error-safe: All exceptions are caught and mapped to descriptive errors.
 */
class PayAiroQRScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val moduleScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun getName(): String = MODULE_NAME

    override fun invalidate() {
        moduleScope.cancel()
        super.invalidate()
    }

    /**
     * Scans QR code from an image file
     * 
     * @param imageUri Local image URI (file:// or content://)
     * @param promise React Native promise for async result
     */
    @ReactMethod
    fun scanQRCodeFromImage(imageUri: String, promise: Promise) {
        moduleScope.launch {
            try {
                val result = processImage(imageUri)
                if (result != null) {
                    val response = Arguments.createMap().apply {
                        putString("value", result)
                        putString("format", "QR_CODE")
                    }
                    promise.resolve(response)
                } else {
                    promise.resolve(null)
                }
            } catch (e: QRScannerException) {
                promise.reject(e.code, e.message, e)
            } catch (e: Exception) {
                promise.reject(
                    ErrorCodes.UNKNOWN_ERROR,
                    "Unexpected error during QR scan: ${e.message}",
                    e
                )
            }
        }
    }

    private fun processImage(imageUri: String): String? {
        // Validate URI
        if (imageUri.isBlank()) {
            throw QRScannerException(ErrorCodes.INVALID_URI, "Image URI is empty or blank")
        }

        val uri = try {
            Uri.parse(imageUri)
        } catch (e: Exception) {
            throw QRScannerException(ErrorCodes.INVALID_URI, "Invalid URI format: $imageUri")
        }

        // Load bitmap from URI
        val bitmap = loadBitmapFromUri(uri)
            ?: throw QRScannerException(ErrorCodes.IMAGE_LOAD_FAILED, "Failed to load image from URI")

        // Apply EXIF rotation if needed
        val rotatedBitmap = applyExifRotation(uri, bitmap)

        // Decode QR code
        return decodeQRCode(rotatedBitmap)
    }

    private fun loadBitmapFromUri(uri: Uri): Bitmap? {
        return try {
            val inputStream: InputStream? = when (uri.scheme) {
                "content" -> reactContext.contentResolver.openInputStream(uri)
                "file" -> {
                    val path = uri.path ?: return null
                    java.io.FileInputStream(path)
                }
                else -> {
                    // Try as file path directly
                    val path = uri.toString().removePrefix("file://")
                    java.io.FileInputStream(path)
                }
            }

            inputStream?.use { stream ->
                val options = BitmapFactory.Options().apply {
                    // First, decode bounds only to check image size
                    inJustDecodeBounds = true
                }
                
                // We need to reopen the stream for actual decoding
                val boundsStream = when (uri.scheme) {
                    "content" -> reactContext.contentResolver.openInputStream(uri)
                    "file" -> java.io.FileInputStream(uri.path!!)
                    else -> java.io.FileInputStream(uri.toString().removePrefix("file://"))
                }
                
                boundsStream?.use { bs ->
                    BitmapFactory.decodeStream(bs, null, options)
                }

                // Calculate sample size to avoid OOM for large images
                options.inSampleSize = calculateInSampleSize(options, MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION)
                options.inJustDecodeBounds = false

                // Reopen stream for actual decoding
                val decodeStream = when (uri.scheme) {
                    "content" -> reactContext.contentResolver.openInputStream(uri)
                    "file" -> java.io.FileInputStream(uri.path!!)
                    else -> java.io.FileInputStream(uri.toString().removePrefix("file://"))
                }

                decodeStream?.use { ds ->
                    BitmapFactory.decodeStream(ds, null, options)
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
        val (height, width) = options.outHeight to options.outWidth
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2

            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }

    private fun applyExifRotation(uri: Uri, bitmap: Bitmap): Bitmap {
        return try {
            val inputStream = when (uri.scheme) {
                "content" -> reactContext.contentResolver.openInputStream(uri)
                "file" -> java.io.FileInputStream(uri.path!!)
                else -> java.io.FileInputStream(uri.toString().removePrefix("file://"))
            } ?: return bitmap

            val exif = inputStream.use { ExifInterface(it) }
            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )

            val rotationDegrees = when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                else -> 0f
            }

            if (rotationDegrees != 0f) {
                val matrix = Matrix().apply { postRotate(rotationDegrees) }
                Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            } else {
                bitmap
            }
        } catch (e: Exception) {
            // If EXIF reading fails, return original bitmap
            bitmap
        }
    }

    private fun decodeQRCode(bitmap: Bitmap): String? {
        val width = bitmap.width
        val height = bitmap.height
        val pixels = IntArray(width * height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

        val source = RGBLuminanceSource(width, height, pixels)
        val binaryBitmap = BinaryBitmap(HybridBinarizer(source))

        val hints = mapOf(
            DecodeHintType.POSSIBLE_FORMATS to listOf(BarcodeFormat.QR_CODE),
            DecodeHintType.TRY_HARDER to true
        )

        return try {
            val reader = MultiFormatReader()
            val result = reader.decode(binaryBitmap, hints)
            result.text
        } catch (e: NotFoundException) {
            // Try with inverted colors (white QR on black background)
            try {
                val invertedSource = source.invert()
                val invertedBitmap = BinaryBitmap(HybridBinarizer(invertedSource))
                val reader = MultiFormatReader()
                val result = reader.decode(invertedBitmap, hints)
                result.text
            } catch (e2: Exception) {
                null
            }
        } catch (e: ChecksumException) {
            throw QRScannerException(ErrorCodes.CORRUPTED_QR, "QR code is corrupted or unreadable")
        } catch (e: FormatException) {
            throw QRScannerException(ErrorCodes.INVALID_FORMAT, "Invalid QR code format")
        }
    }

    companion object {
        const val MODULE_NAME = "PayAiroQRScanner"
        private const val MAX_IMAGE_DIMENSION = 2048
    }

    private object ErrorCodes {
        const val INVALID_URI = "INVALID_URI"
        const val IMAGE_LOAD_FAILED = "IMAGE_LOAD_FAILED"
        const val CORRUPTED_QR = "CORRUPTED_QR"
        const val INVALID_FORMAT = "INVALID_FORMAT"
        const val UNKNOWN_ERROR = "UNKNOWN_ERROR"
    }

    private class QRScannerException(val code: String, message: String) : Exception(message)
}
