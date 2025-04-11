import { View, StyleSheet, TouchableOpacity, Dimensions, LayoutChangeEvent } from 'react-native'
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useDerivedValue,
  FadeOut,
  runOnJS,
  withSpring,
  Easing
} from 'react-native-reanimated'
import { ExpandableCompProps } from '../animations-functions/types';
import { getAnimationConfig, getPopSpringConfig } from '../animations-functions/animationUtils';
import { themes } from 'styles';
import { useSelector } from 'react-redux';

import { ANIMATION_CONSTANTS } from 'tsx-components/CryptoCard';

export interface ExpandableCompRef {
  toggleCardSize: () => void;
}

// Animation constants
const ANIMATION_CONFIG = {
  TIMING_DURATION: 1500,
  FADE_DURATION: 800,
  TEXT_DURATION: 1000,
  EASING: Easing.bezier(0.25, 0.1, 0.25, 1),
  COLLAPSE_DURATION: 500,
};

const ExpandableComp = forwardRef<ExpandableCompRef, ExpandableCompProps>(({
  children,
  initialWidth = 50,
  initialHeight = 100,
  containerHeight = 120,
  position = {
    top: ANIMATION_CONSTANTS.EXPANDABLE_CARD.POSITION.top,
    right: ANIMATION_CONSTANTS.EXPANDABLE_CARD.POSITION.right,
    left: 0,
    bottom: 0,
  },
  backgroundColor = 'red',
  borderRadius = 8,
  duration = 1000,
  parentLayout,
  onAnimationComplete,
  onPress,
  style
}: ExpandableCompProps, ref) => {
  const { width: screenWidth } = Dimensions.get('window')

  // Redux 
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);


  // Reference to track actual layout measurements
  const [containerWidth, setContainerWidth] = useState(screenWidth);
  const [componentColor, setComponentColor] = useState(backgroundColor);

  // For measuring container width
  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setContainerWidth(width)
  }

  const { width: parentWidth, height: parentHeight } = parentLayout || { width: 0, height: 0 };

  // Track expanded state
  const [expanded, setExpanded] = useState(false)

  // Track visibility state for fade effect
  const [visible, setVisible] = useState(true)

  // Create animated progress value
  const progress = useSharedValue(0)

  // Create scale animation for pop-up effect
  const scale = useSharedValue(1)

  // Create derived animated values
  const animatedWidth = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [initialWidth, parentWidth]
    )
  })

  const animatedHeight = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [initialHeight, parentHeight]
    )
  })

  const animatedTranslateX = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [0, ANIMATION_CONSTANTS.EXPANDABLE_CARD.POSITION.right - 10]
    )
  })

  const animatedTranslateY = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
      [0, (-(containerHeight - initialHeight) / 2) - ((position?.top || 0) + 20)]
    )
  })

  // Add animated opacity that decreases as the card expands
  const animatedOpacity = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 0.2, 0.4, 0.6, 1],  // Simplified control points for a smoother curve
      [1, 0.9, 0.8, 0.7, 1]   // Opacity values corresponding to progress points
    );
  })

  // Create animated styles
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: position?.top,
      right: position?.right,
      width: animatedWidth.value,
      height: animatedHeight.value,
      backgroundColor: componentColor,
      borderRadius,
      opacity: animatedOpacity.value, // Use the animated opacity value
      transform: [
        { translateX: animatedTranslateX.value },
        { translateY: animatedTranslateY.value },
        { scale: scale.value }
      ]
    }
  })

  // Handler function to reset component
  const handleAnimationComplete = () => {

    // if (isCrypto) {
    // Reset the component after fade out animation
    setTimeout(() => {
      setExpanded(false);
      progress.value = 0;

      // Set scale to 0 before showing the element
      scale.value = 0;
      setComponentColor(componentColor == themes.light.colors.palette.green700 ? themes.light.colors.palette.white : themes.light.colors.palette.green700);
      // Make the component visible again
      setVisible(true);

      // Animate scale from 0 to 1 with a spring effect for pop-up
      scale.value = withTiming(1, {
        duration: ANIMATION_CONFIG.COLLAPSE_DURATION,
        easing: ANIMATION_CONFIG.EASING,
      });

      // Call the external callback if provided
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 500); // Matches the fade out duration
    // }else {
    //   setTimeout(() => {
    //     scale.value = withTiming(0, {
    //       duration: ANIMATION_CONFIG.TIMING_DURATION,
    //       easing: ANIMATION_CONFIG.EASING,
    //     });

    //     setVisible(false);
    //     // progress.value = 1;

    //     // Set scale to 0 before showing the element
    //     // scale.value = 1;
    //     setComponentColor(componentColor == themes.light.colors.palette.green700 ? themes.light.colors.palette.white : themes.light.colors.palette.green700);
    //     // Make the component visible again

    //     // Animate scale from 0 to 1 with a spring effect for pop-up

    //     // Call the external callback if provided
    //     if (onAnimationComplete) {
    //       onAnimationComplete();
    //     }
    //   }, 100); // Matches the fade out duration
    // }
  }

  // Expose the toggleCardSize function through the ref
  useImperativeHandle(ref, () => ({
    toggleCardSize: () => {
      // Toggle expanded state
      const newExpanded = !expanded
      setExpanded(newExpanded)
      // if (isCrypto) {
        if (newExpanded) {
          // Animate to expanded state
          progress.value = withTiming(1, {
            duration: ANIMATION_CONFIG.TIMING_DURATION,
            easing: ANIMATION_CONFIG.EASING,
          }, (finished) => {
            if (finished) {
              runOnJS(handleAnimationComplete)();
            }
          });
        } else {
          progress.value = withTiming(0, {
            duration: ANIMATION_CONFIG.COLLAPSE_DURATION,
            easing: ANIMATION_CONFIG.EASING,
          });
        }
      // } else {

      //   scale.value = withTiming(0, {
      //     duration: ANIMATION_CONFIG.TIMING_DURATION,
      //     easing: ANIMATION_CONFIG.EASING,
      //   });

      //   setTimeout(() => {
      //     scale.value = 0;


      //     scale.value = withTiming(1, {
      //       duration: ANIMATION_CONFIG.TIMING_DURATION,
      //       easing: ANIMATION_CONFIG.EASING,
      //     });
      //     setTimeout(() => { 
      //       setComponentColor( themes.light.colors.palette.white );
      //     }, 100);
      //   }, ANIMATION_CONFIG.TIMING_DURATION);

      // }
    }
  }))

  // Animation function
  // const toggleCardSize = () => {
  //   // Toggle expanded state
  //   console.log("calling from toggleCardSize ")
  //   const newExpanded = !expanded
  //   setExpanded(newExpanded)

  //   if (newExpanded) {
  //     // Animate to expanded state
  //     progress.value = withTiming(1, getAnimationConfig(duration), (finished) => {
  //       if (finished) {
  //         // Use runOnJS to call our function from the UI thread
  //         runOnJS(handleAnimationComplete)()
  //       }
  //     })
  //   } else {
  //     // Animate to collapsed state
  //     progress.value = withTiming(0, getAnimationConfig(duration / 2))
  //   }
  // }

  return (
    <View
      style={styles.container}
      onLayout={onLayout}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          // toggleCardSize();
          onPress?.();
        }}
        style={styles.touchable}
      >
        {visible && (
          <Animated.View
            style={[animatedCardStyle, style]}
            exiting={FadeOut.duration(500)}
          >
            {children}
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  )
})

export default ExpandableComp;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  touchable: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 50,
  },
})