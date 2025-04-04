import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { FadeWrapperProps } from '../animations-functions/types';
import { getAnimationConfig } from '../animations-functions/animationUtils';

const FadeWrapper = ({
  children,
  visible = true,
  duration = 300,
  onComplete,
}: FadeWrapperProps) => {
  // Initialize with current visibility state
  const opacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    // Cancel any ongoing animation
    cancelAnimation(opacity);

    // Get animation configuration
    const animationConfig = getAnimationConfig(duration);

    // Animate to new value
    opacity.value = withTiming(
      visible ? 1 : 0, 
      animationConfig,
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );

    // Cleanup function
    return () => {
      cancelAnimation(opacity);
    };
  }, [visible, duration, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

  if (!children) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default FadeWrapper; 