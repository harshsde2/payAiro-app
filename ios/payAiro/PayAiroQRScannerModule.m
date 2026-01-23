//
//  PayAiroQRScannerModule.m
//  payAiro
//
//  React Native bridge for PayAiroQRScanner Swift module.
//  Exposes the native QR scanner to JavaScript.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PayAiroQRScanner, NSObject)

RCT_EXTERN_METHOD(scanQRCodeFromImage:(NSString *)imageUri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
