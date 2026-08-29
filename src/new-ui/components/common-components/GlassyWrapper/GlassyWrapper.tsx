import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { IGlassyWrapperProps } from './types';

const GlassyWrapper: React.FC<IGlassyWrapperProps> = ({
  children,
  style,
  borderRadius = 20,
  blurAmount = 25,
  blurType,
  overlayOpacity = 0.12,
  borderWidth = 1,
  borderColor,
  padding = 0,
  showGlossyHighlight = true,
  flowLayout = false,
}) => {
  const { theme } = useTheme();
  const { isDark } = theme;

  // Frosted glass is white-on-light by nature; on dark it has to invert or it reads as a
  // bright card floating on a black screen. Explicit props still win.
  const resolvedBlurType = blurType ?? (isDark ? 'dark' : 'light');
  const resolvedBorderColor = borderColor ?? theme.colors.glassBorder;
  const overlayTint = isDark
    ? `rgba(0, 0, 0, ${overlayOpacity})`
    : `rgba(255, 255, 255, ${overlayOpacity})`;

  const containerStyle = [
    styles.container,
    { borderRadius, borderWidth, borderColor: resolvedBorderColor, padding },
    style,
  ];

  const overlayStyle = [
    styles.overlay,
    { borderRadius },
    { backgroundColor: overlayTint },
  ];

  const flowContentStyle = [
    styles.flowContent,
    padding > 0 ? { padding } : undefined,
  ];

  const overlayContentStyle = [
    styles.contentWrapper,
    padding > 0 ? { padding } : undefined,
  ];

  return (
    <View style={containerStyle}>
      {/* 1. Blurred transparent background */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          blurType={resolvedBlurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={theme.colors.glassTint}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius, backgroundColor: theme.colors.glassTint },
          ]}
        />
      )}

      {/* 2. Semi-transparent white overlay for frosted tint */}
      <View style={overlayStyle} pointerEvents="none" />

      {/* 3. Glossy highlight - white crescent on top-left (light reflection) */}
      {showGlossyHighlight && (
        <LinearGradient
          colors={
            isDark
              ? [
                  'rgba(255, 255, 255, 0.16)',
                  'rgba(255, 255, 255, 0.08)',
                  'rgba(255, 255, 255, 0.03)',
                  'transparent',
                ]
              : [
                  'rgba(255, 255, 255, 0.5)',
                  'rgba(255, 255, 255, 0.25)',
                  'rgba(255, 255, 255, 0.08)',
                  'transparent',
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glossyHighlight, { borderRadius }]}
          pointerEvents="none"
        />
      )}

      {/* 4. Children content */}
      <View style={flowLayout ? flowContentStyle : overlayContentStyle}>{children}</View>
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
  flowContent: {
    width: '100%',
    zIndex: 1,
  },
});

export default GlassyWrapper;
