import { View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GhostSlideProps } from '../animations-functions/types';
import { getInitialTranslateX, getInitialTranslateY, getAnimationConfig } from '../animations-functions/animationUtils';

const GhostSlide = ({ 
  visible = true,
  children,
  duration = 300,
  direction = 'down',
  style,
  distance = 100,
  customX = 0,
  customY = 0,
  onAnimationComplete,
  ghostOpacity = 0.6,
}: GhostSlideProps) => {
  // Add ref to track previous visibility state
  const prevVisibleRef = useRef<boolean>(visible);
  
  // Create shared values for translation and opacity
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  // State for triggering the ghost effect
  const isAnimating = useSharedValue(0);

  // Update animation values when visibility or direction/custom values change
  useEffect(() => {
    // Only trigger effect when visibility actually changes from true to false
    const visibilityChanged = prevVisibleRef.current !== visible;
    const isBecomingHidden = prevVisibleRef.current === true && visible === false;
    
    // Update ref with current visibility for next render
    prevVisibleRef.current = visible;
    
    // Only trigger the ghost effect when explicitly hiding the component
    if (visibilityChanged && isBecomingHidden) {
      // When hiding, start the ghost effect
      isAnimating.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = ghostOpacity;
      
      // Animate ghost sliding away
      const animationConfig = getAnimationConfig(duration);

      translateX.value = withTiming(getInitialTranslateX(direction, distance, customX), animationConfig);
      translateY.value = withTiming(getInitialTranslateY(direction, distance, customY), animationConfig);
      opacity.value = withTiming(0, animationConfig, (finished) => {
        if (finished) {
          isAnimating.value = 0;
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        }
      });
    } else if (visibilityChanged && visible) {
      // When showing, no need for ghost effect
      isAnimating.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
    }
  }, [visible, direction, distance, customX, customY, duration, ghostOpacity, onAnimationComplete]);

  // Create animated styles for the ghost
  const ghostAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
      zIndex: 1,
    };
  });

  // Animated style for conditional rendering of ghost
  const ghostContainerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 1,
      opacity: isAnimating.value,
    };
  });

  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* The original content stays in place */}
      <View>{children}</View>
      
      {/* The ghost duplicate that slides away */}
      <Animated.View style={ghostContainerStyle}>
        <Animated.View style={ghostAnimatedStyle}>
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default GhostSlide; 