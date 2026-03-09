import React, { useEffect, useCallback } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
import BootSplash from "react-native-bootsplash";
import SphereDissolve from "./SphereDissolve";
import GreenRingOutline from "./GreenRingOutline";
import FlatLogoReveal from "./FlatLogoReveal";
import { IAnimatedBootSplashV3Props } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;
const SPHERE_RADIUS = 84;
const SCREEN_DIAGONAL =
  Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2) / 2 + 40;

const AnimatedBootSplashV3: React.FC<IAnimatedBootSplashV3Props> = ({
  onAnimationEnd,
}) => {
  const sphereFade = useSharedValue(0);
  const ringRadius = useSharedValue(SPHERE_RADIUS);
  const ringOpacity = useSharedValue(0);
  const ringColorProgress = useSharedValue(0);
  const fullLogoOpacity = useSharedValue(0);
  const fullLogoScale = useSharedValue(1);
  const fullLogoTextProgress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const handleAnimationComplete = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 250);

    sphereFade.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    ringColorProgress.value = withDelay(
      200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    ringOpacity.value = withDelay(
      200,
      withSequence(
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        }),
        withDelay(
          1200,
          withTiming(0, {
            duration: 1000,
            easing: Easing.in(Easing.quad),
          }),
        ),
      ),
    );

    ringRadius.value = withDelay(
      1000,
      withTiming(SCREEN_DIAGONAL, {
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    fullLogoOpacity.value = withDelay(
      800,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      }),
    );

    fullLogoTextProgress.value = withDelay(
      1000,
      withTiming(1, {
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    screenOpacity.value = withDelay(
      3200,
      withTiming(
        0,
        {
          duration: 500,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(handleAnimationComplete)();
          }
        },
      ),
    );

    return () => clearTimeout(timeoutId);
  }, [handleAnimationComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Canvas style={styles.canvas}>
        <GreenRingOutline
          ringRadius={ringRadius}
          ringOpacity={ringOpacity}
          ringColorProgress={ringColorProgress}
          centerX={CENTER_X}
          centerY={CENTER_Y}
        />
        <SphereDissolve
          sphereFade={sphereFade}
          centerX={CENTER_X}
          centerY={CENTER_Y}
          radius={SPHERE_RADIUS}
        />
        <FlatLogoReveal
          flatLogoOpacity={fullLogoOpacity}
          flatLogoScale={fullLogoScale}
          textRevealProgress={fullLogoTextProgress}
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
    backgroundColor: "#FFFFFF",
    zIndex: 9999,
  },
  canvas: {
    flex: 1,
  },
});

export default AnimatedBootSplashV3;
