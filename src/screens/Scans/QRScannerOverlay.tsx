import React, { memo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { IQRScannerOverlayProps } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

// SVG Corner Mask Component
const CornerMask = ({
  size,
  color,
  opacity,
  style,
}: {
  size: number;
  color: string;
  opacity: number;
  style?: any;
}) => (
  <View style={[{ width: size, height: size }, style]} pointerEvents="none">
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`M0 0 L${size} 0 A${size} ${size} 0 0 0 0 ${size} Z`}
        fill={color}
        fillOpacity={opacity}
      />
    </Svg>
  </View>
);

/**
 * Custom QR Scanner Overlay Component
 * Provides a professional-looking scanner frame with animated scanning line
 */
const QRScannerOverlay: React.FC<IQRScannerOverlayProps> = ({
  scanAreaSize = DEFAULT_SCAN_AREA_SIZE,
  borderColor = "#00D9FF",
  borderWidth = 3,
  cornerLength = 30,
  cornerRadius = 12,
  overlayOpacity = 0.7,
  isScanning = true,
}) => {
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  // Animated scanning line effect
  useEffect(() => {
    if (isScanning) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnimation, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnimation, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [isScanning, scanLineAnimation]);

  const scanLineTranslateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scanAreaSize - 4],
  });

  // Calculate horizontal overlay width (vertical uses flex: 1)
  const horizontalOverlayWidth = (SCREEN_WIDTH - scanAreaSize) / 2;

  const renderCorner = (position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight") => {
    const cornerStyles: Record<string, object> = {
      topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: borderWidth,
        borderLeftWidth: borderWidth,
        borderTopLeftRadius: cornerRadius,
      },
      topRight: {
        top: 0,
        right: 0,
        borderTopWidth: borderWidth,
        borderRightWidth: borderWidth,
        borderTopRightRadius: cornerRadius,
      },
      bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: borderWidth,
        borderLeftWidth: borderWidth,
        borderBottomLeftRadius: cornerRadius,
      },
      bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: borderWidth,
        borderRightWidth: borderWidth,
        borderBottomRightRadius: cornerRadius,
      },
    };

    return (
      <View
        style={[
          styles.corner,
          {
            width: cornerLength,
            height: cornerLength,
            borderColor,
          },
          cornerStyles[position],
        ]}
      />
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top overlay - uses flex:1 to fill available space above scan area */}
      <View
        style={[
          styles.overlay,
          styles.topBottomOverlay,
          { opacity: overlayOpacity },
        ]}
      />

      {/* Middle row */}
      <View style={styles.middleRow}>
        {/* Left overlay */}
        <View
          style={[
            styles.overlay,
            {
              width: horizontalOverlayWidth,
              height: scanAreaSize,
              opacity: overlayOpacity,
            },
          ]}
        />

        {/* Scan area (transparent) */}
        <View style={[styles.scanArea, { width: scanAreaSize, height: scanAreaSize }]}>
          {/* Corner Masks - to round the sharp corners of the hole */}
          <CornerMask
            size={cornerRadius}
            color="#000000"
            opacity={overlayOpacity}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
          <CornerMask
            size={cornerRadius}
            color="#000000"
            opacity={overlayOpacity}
            style={{ position: "absolute", top: 0, right: 0, transform: [{ rotate: "90deg" }] }}
          />
          <CornerMask
            size={cornerRadius}
            color="#000000"
            opacity={overlayOpacity}
            style={{ position: "absolute", bottom: 0, right: 0, transform: [{ rotate: "180deg" }] }}
          />
          <CornerMask
            size={cornerRadius}
            color="#000000"
            opacity={overlayOpacity}
            style={{ position: "absolute", bottom: 0, left: 0, transform: [{ rotate: "270deg" }] }}
          />

          {/* Corner markers */}
          {renderCorner("topLeft")}
          {renderCorner("topRight")}
          {renderCorner("bottomLeft")}
          {renderCorner("bottomRight")}

          {/* Animated scan line */}
          {isScanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: borderColor,
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            />
          )}
        </View>

        {/* Right overlay */}
        <View
          style={[
            styles.overlay,
            {
              width: horizontalOverlayWidth,
              height: scanAreaSize,
              opacity: overlayOpacity,
            },
          ]}
        />
      </View>

      {/* Bottom overlay - uses flex:1 to fill available space below scan area */}
      <View
        style={[
          styles.overlay,
          styles.topBottomOverlay,
          { opacity: overlayOpacity },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },
  overlay: {
    backgroundColor: "#000000",
  },
  topBottomOverlay: {
    flex: 1,
    width: "100%",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanArea: {
    position: "relative",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    borderColor: "#00D9FF",
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default memo(QRScannerOverlay);
