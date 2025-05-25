import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

type FadeWrapperProps = {
  firstComponent: React.ReactNode;
  secondComponent: React.ReactNode;
  visible: boolean; // true = show second, false = show first
  duration?: number; // total duration (e.g. 1000ms = 500ms out + 500ms in)
  style?: ViewStyle[] | ViewStyle;
  onComplete?: () => void;
};

const FadeWrapper = ({
  firstComponent,
  secondComponent,
  visible = true,
  duration = 1000,
  style,
  onComplete,
}: FadeWrapperProps) => {
  const halfDuration = duration / 2;

  const firstOpacity = useSharedValue(visible ? 1 : 0);
  const secondOpacity = useSharedValue(visible ? 0 : 1);

  useEffect(() => {
    cancelAnimation(firstOpacity);
    cancelAnimation(secondOpacity);

    const config = {
      duration: halfDuration,
      easing: Easing.inOut(Easing.ease),
    };

    if (visible) {
      // Step 1: Fade out firstComponent
      firstOpacity.value = withTiming(0, config, (fadeOutFinished) => {
        if (fadeOutFinished) {
          // Step 2: Fade in secondComponent
          secondOpacity.value = withTiming(1, config, (fadeInFinished) => {
            if (fadeInFinished && onComplete) runOnJS(onComplete)();
          });
        }
      });
    } else {
      // Step 1: Fade out secondComponent
      secondOpacity.value = withTiming(0, config, (fadeOutFinished) => {
        if (fadeOutFinished) {
          // Step 2: Fade in firstComponent
          firstOpacity.value = withTiming(1, config, (fadeInFinished) => {
            if (fadeInFinished && onComplete) runOnJS(onComplete)();
          });
        }
      });
    }

    return () => {
      cancelAnimation(firstOpacity);
      cancelAnimation(secondOpacity);
    };
  }, [visible]);

  const firstStyle = useAnimatedStyle(() => ({
    opacity: firstOpacity.value,
    position: 'absolute',
    width: '100%',
  }));

  const secondStyle = useAnimatedStyle(() => ({
    opacity: secondOpacity.value,
    position: 'absolute',
    width: '100%',
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={firstStyle}>{firstComponent}</Animated.View>
      <Animated.View style={secondStyle}>{secondComponent}</Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
});

export default FadeWrapper;
