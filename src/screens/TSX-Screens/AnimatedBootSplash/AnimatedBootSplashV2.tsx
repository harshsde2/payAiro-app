import React, { useEffect, useCallback } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
import BootSplash from "react-native-bootsplash";
import GlowSphere from "./GlowSphere";
import ExpandingGlow from "./ExpandingGlow";
import FlatLogoReveal from "./FlatLogoReveal";
import { IAnimatedBootSplashV2Props } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;
const SPHERE_RADIUS = 90;
const BG_COLOR = "#FFFFFF";

const AnimatedBootSplashV2: React.FC<IAnimatedBootSplashV2Props> = ({
  onAnimationEnd,
}) => {
  const sphereScale = useSharedValue(0);
  const sphereOpacity = useSharedValue(1);
  const glassOpacity = useSharedValue(0);
  const orbAngle = useSharedValue(0);
  const glowRadius = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const flatLogoOpacity = useSharedValue(0);
  const flatLogoScale = useSharedValue(0.3);
  const textRevealProgress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const handleAnimationComplete = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 250);

    sphereScale.value = withSpring(1, { damping: 14, stiffness: 120 });

    glassOpacity.value = withDelay(
      300,
      withTiming(0.6, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    orbAngle.value = withDelay(
      300,
      withTiming(2 * Math.PI, {
        duration: 2000,
        easing: Easing.linear,
      }),
    );

    glowRadius.value = withDelay(
      1200,
      withSequence(
        withTiming(3, {
          duration: 1600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withDelay(400, withTiming(5, { duration: 800, easing: Easing.linear })),
      ),
    );
    glowOpacity.value = withDelay(
      1200,
      withSequence(
        withTiming(0.5, {
          duration: 1200,
          easing: Easing.out(Easing.quad),
        }),
        withDelay(800, withTiming(0, { duration: 800, easing: Easing.in(Easing.quad) })),
      ),
    );

    sphereOpacity.value = withDelay(
      2200,
      withTiming(0, {
        duration: 800,
        easing: Easing.in(Easing.quad),
      }),
    );
    flatLogoOpacity.value = withDelay(
      2200,
      withTiming(1, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      }),
    );
    flatLogoScale.value = withDelay(
      2200,
      withTiming(1, {
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    textRevealProgress.value = withDelay(
      2800,
      withTiming(1, {
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    screenOpacity.value = withDelay(
      4200,
      withTiming(0, {
        duration: 600,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      }),
    );

    return () => clearTimeout(timeoutId);
  }, [handleAnimationComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Canvas style={styles.canvas}>
        <ExpandingGlow
          glowRadius={glowRadius}
          glowOpacity={glowOpacity}
          centerX={CENTER_X}
          centerY={CENTER_Y}
        />
        <GlowSphere
          sphereScale={sphereScale}
          sphereOpacity={sphereOpacity}
          glassOpacity={glassOpacity}
          orbAngle={orbAngle}
          centerX={CENTER_X}
          centerY={CENTER_Y}
          radius={SPHERE_RADIUS}
        />
        <FlatLogoReveal
          flatLogoOpacity={flatLogoOpacity}
          flatLogoScale={flatLogoScale}
          textRevealProgress={textRevealProgress}
          centerX={CENTER_X}
          centerY={CENTER_Y}
        />
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG_COLOR,
    zIndex: 9999,
  },
  canvas: {
    flex: 1,
  },
});

export default AnimatedBootSplashV2;
