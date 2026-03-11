import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { IGlassyWrapperProps } from './types';

const GlassyWrapper: React.FC<IGlassyWrapperProps> = ({
  children,
  style,
  borderRadius = 20,
  blurAmount = 25,
  blurType = 'light',
  overlayOpacity = 0.12,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.6)',
  padding = 0,
  showGlossyHighlight = true,
}) => {
  const containerStyle = [
    styles.container,
    { borderRadius, borderWidth, borderColor, padding },
    style,
  ];

  const overlayStyle = [
    styles.overlay,
    { borderRadius },
    { backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})` },
  ];

  const contentWrapperStyle = [
    styles.contentWrapper,
    padding > 0 ? { padding } : undefined,
  ];

  return (
    <View style={containerStyle}>
      {/* 1. Blurred transparent background */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.4)"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
          ]}
        />
      )}

      {/* 2. Semi-transparent white overlay for frosted tint */}
      <View style={overlayStyle} pointerEvents="none" />

      {/* 3. Glossy highlight - white crescent on top-left (light reflection) */}
      {showGlossyHighlight && (
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.25)',
            'rgba(255, 255, 255, 0.08)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glossyHighlight, { borderRadius }]}
          pointerEvents="none"
        />
      )}

      {/* 4. Children content */}
      <View style={[styles.contentWrapper, contentWrapperStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glossyHighlight: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlassyWrapper;
