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
import ParticleField from "./ParticleField";
import LogoReveal from "./LogoReveal";
import { IAnimatedBootSplashProps } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;
const BG_COLOR = "#2C6A3F";

const TIMING = {
  PARTICLES_ORBIT_DURATION: 2500,
  PARTICLES_CONVERGE_DELAY: 1200,
  PARTICLES_CONVERGE_DURATION: 800,
  LOGO_DRAW_DELAY: 2500,
  LOGO_DRAW_DURATION: 600,
  TEXT_DRAW_DELAY: 3100,
  TEXT_DRAW_DURATION: 500,
  FILL_REVEAL_DELAY: 3600,
  FILL_REVEAL_DURATION: 300,
  SCALE_DELAY: 3900,
  FADE_OUT_DELAY: 4500,
  FADE_OUT_DURATION: 500,
} as const;

const AnimatedBootSplash: React.FC<IAnimatedBootSplashProps> = ({
  onAnimationEnd,
}) => {
  // console.log("AnimatedBootSplash");
  const orbitProgress = useSharedValue(0);
  const convergeProgress = useSharedValue(0);
  const logoDrawProgress = useSharedValue(0);
  const textDrawProgress = useSharedValue(0);
  const fillReveal = useSharedValue(0);
  const compositionScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  const handleAnimationComplete = useCallback(() => {
    onAnimationEnd();
  }, [onAnimationEnd]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 250);

    orbitProgress.value = withTiming(1, {
      duration: TIMING.PARTICLES_ORBIT_DURATION,
      easing: Easing.linear,
    });

    convergeProgress.value = withDelay(
      TIMING.PARTICLES_CONVERGE_DELAY,
      withTiming(2, {
        duration: TIMING.PARTICLES_CONVERGE_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    );

    logoDrawProgress.value = withDelay(
      TIMING.LOGO_DRAW_DELAY,
      withTiming(1, {
        duration: TIMING.LOGO_DRAW_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    textDrawProgress.value = withDelay(
      TIMING.TEXT_DRAW_DELAY,
      withTiming(1, {
        duration: TIMING.TEXT_DRAW_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    fillReveal.value = withDelay(
      TIMING.FILL_REVEAL_DELAY,
      withTiming(1, {
        duration: TIMING.FILL_REVEAL_DURATION,
        easing: Easing.out(Easing.quad),
      }),
    );

    compositionScale.value = withDelay(
      TIMING.SCALE_DELAY,
      withSequence(
        withSpring(1.08, { damping: 12, stiffness: 100 }),
        withSpring(1.0, { damping: 15, stiffness: 120 }),
      ),
    );

    screenOpacity.value = withDelay(
      TIMING.FADE_OUT_DELAY,
      withTiming(0, {
        duration: TIMING.FADE_OUT_DURATION,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      }),
    );
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: compositionScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Canvas style={styles.canvas}>
        <ParticleField
          orbitProgress={orbitProgress}
          convergeProgress={convergeProgress}
          centerX={CENTER_X}
          centerY={CENTER_Y}
        />
        <LogoReveal
          logoDrawProgress={logoDrawProgress}
          textDrawProgress={textDrawProgress}
          fillReveal={fillReveal}
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

export default AnimatedBootSplash;
