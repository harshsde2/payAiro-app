import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StatusBar, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { IScreenWrapperProps } from './types';

const ScreenWrapper: React.FC<IScreenWrapperProps> = ({
  children,
  safeArea = true,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  gradient = 'none',
  gradientColors = [],
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 0, y: 1 },
  gradientCenter,
  gradientRadius,
  gradientPositions,
  padding,
  paddingHorizontal,
  paddingVertical,
  scrollable = false,
  scrollViewProps,
  contentContainerStyle,
  backgroundColor,
  backgroundElement,
  statusBarStyle = 'default',
  statusBarHidden = false,
  contentStyle,
  flex = 1,
  loading = false,
  loadingComponent,
  style,
}) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  const resolvedBackgroundColor = backgroundColor || theme.colors.background;

  const resolvedPadding = useMemo(() => {
    if (typeof padding === 'number') {
      return {
        paddingTop: padding,
        paddingBottom: padding,
        paddingLeft: padding,
        paddingRight: padding,
      };
    } else if (typeof padding === 'object') {
      return {
        paddingTop: padding.top ?? padding.vertical,
        paddingBottom: padding.bottom ?? padding.vertical,
        paddingLeft: padding.left ?? padding.horizontal,
        paddingRight: padding.right ?? padding.horizontal,
      };
    }
    return {};
  }, [padding]);

  const paddingStyle: ViewStyle = {
    ...resolvedPadding,
    ...(paddingHorizontal !== undefined && {
      paddingHorizontal,
    }),
    ...(paddingVertical !== undefined && {
      paddingVertical,
    }),
  };

  const containerStyle: ViewStyle = {
    flex,
    backgroundColor: gradient === 'none' ? resolvedBackgroundColor : 'transparent',
    ...style,
  };

  const renderGradient = () => {
    if (gradient === 'none') {
      return null;
    }

    if (gradient === 'linear') {
      return (
        <LinearGradient
          colors={gradientColors.length > 0 ? gradientColors : [resolvedBackgroundColor, resolvedBackgroundColor]}
          start={gradientStart}
          end={gradientEnd}
          style={StyleSheet.absoluteFill}
        />
      );
    }

    if (gradient === 'radial') {
      const centerX = gradientCenter?.x ?? width / 2;
      const centerY = gradientCenter?.y ?? height / 2;
      const radius = gradientRadius ?? Math.max(width, height) * 0.7;

      const validColors = gradientColors.length > 0 
        ? gradientColors.filter(color => color && typeof color === 'string')
        : [resolvedBackgroundColor, resolvedBackgroundColor];

      if (validColors.length === 0) {
        validColors.push(resolvedBackgroundColor, resolvedBackgroundColor);
      }

      return (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={width} height={height}>
            <RadialGradient
              c={vec(centerX, centerY)}
              r={radius}
              colors={validColors}
              positions={
                gradientPositions &&
                gradientPositions.length === validColors.length
                  ? gradientPositions
                  : undefined
              }
            />
          </Rect>
        </Canvas>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[paddingStyle, contentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[paddingStyle, contentStyle]}>
        {children}
      </View>
    );
  };

  const Wrapper = safeArea ? SafeAreaView : View;
  const edges = safeArea ? safeAreaEdges : undefined;

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        hidden={statusBarHidden}
        backgroundColor={resolvedBackgroundColor}
      />
      <Wrapper
        style={containerStyle}
        edges={edges}
      >
        {renderGradient()}
        {backgroundElement}
        {renderContent()}
        {loading && (
          <View style={styles.loadingOverlay}>
            {loadingComponent || (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )}
          </View>
        )}
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default ScreenWrapper;

