import React, { useEffect, useRef } from 'react';
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
  style,
  fadeInOut = false,
  fadeOutDuration,
  fadeInDuration,
  onFadeOutComplete,
}: FadeWrapperProps) => {
  // Initialize with current visibility state
  const opacity = useSharedValue(visible ? 1 : 0);
  const isFadingInAfterOut = useRef(false);
  
  // Use provided durations or fall back to main duration
  const actualFadeOutDuration = fadeOutDuration || duration;
  const actualFadeInDuration = fadeInDuration || duration;

  useEffect(() => {
    // Cancel any ongoing animation
    cancelAnimation(opacity);
    
    // For normal operation (non-fadeInOut)
    if (!fadeInOut) {
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
    } 
    // For fadeInOut operation
    else if (visible && !isFadingInAfterOut.current) {
      // First fade out
      const fadeOutConfig = getAnimationConfig(actualFadeOutDuration);
      isFadingInAfterOut.current = true;
      
      opacity.value = withTiming(
        0, 
        fadeOutConfig,
        (finished) => {
          if (finished) {
            // After fade out is complete, trigger fade in
            if (onFadeOutComplete) {
              runOnJS(onFadeOutComplete)();
            }
            
            const fadeInConfig = getAnimationConfig(actualFadeInDuration);
            opacity.value = withTiming(
              1, 
              fadeInConfig,
              (innerFinished) => {
                if (innerFinished) {
                  isFadingInAfterOut.current = false;
                  if (onComplete) {
                    runOnJS(onComplete)();
                  }
                }
              }
            );
          }
        }
      );
    } else if (!visible) {
      // Handle normal fade out when visible becomes false
      const animationConfig = getAnimationConfig(duration);
      isFadingInAfterOut.current = false;
      
      opacity.value = withTiming(
        0, 
        animationConfig,
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }
      );
    }

    // Cleanup function
    return () => {
      cancelAnimation(opacity);
    };
  }, [visible, duration, onComplete, fadeInOut, actualFadeOutDuration, actualFadeInDuration, onFadeOutComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

  if (!children) {
    return null;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
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