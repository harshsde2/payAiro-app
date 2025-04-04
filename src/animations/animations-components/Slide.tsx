import React, { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SlideProps } from '../animations-functions/types';
import { getInitialTranslateX, getInitialTranslateY, getAnimationConfig } from '../animations-functions/animationUtils';

const Slide = ({ 
  visible = true,
  children,
  duration = 300,
  direction = 'up',
  style,
  distance = 100,
  customX = 0,
  customY = 0,
  onAnimationComplete,
}: SlideProps) => {
  // Create shared values for translation and opacity
  const translateX = useSharedValue(getInitialTranslateX(direction, distance, customX));
  const translateY = useSharedValue(getInitialTranslateY(direction, distance, customY));
  const opacity = useSharedValue(visible ? 1 : 0);

  // Update animation values when visibility or direction/custom values change
  useEffect(() => {
    // Set up translations based on visibility and direction/custom values
    const translateXValue = visible ? 0 : getInitialTranslateX(direction, distance, customX);
    const translateYValue = visible ? 0 : getInitialTranslateY(direction, distance, customY);
    
    // Animation config
    const animationConfig = getAnimationConfig(duration);

    // Animate translations
    translateX.value = withTiming(translateXValue, animationConfig);
    translateY.value = withTiming(translateYValue, animationConfig);
    
    // Animate opacity with callback on completion
    opacity.value = withTiming(
      visible ? 1 : 0, 
      animationConfig,
      (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      }
    );
  }, [visible, direction, distance, customX, customY, duration, onAnimationComplete]);

  // Create animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default Slide;