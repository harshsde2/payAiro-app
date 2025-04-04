import { View, StyleSheet, TouchableOpacity, Dimensions, LayoutChangeEvent } from 'react-native'
import React, { useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useDerivedValue,
  FadeOut,
  runOnJS,
  withSpring,
} from 'react-native-reanimated'
import { ExpandableCompProps } from '../animations-functions/types';
import { getAnimationConfig, getPopSpringConfig } from '../animations-functions/animationUtils';

const ExpandableComp = ({
  children,
  initialWidth = 50,
  initialHeight = 100,
  containerHeight = 120,
  position = {
    top: 50,
    right: 20,
    left: 0,
    bottom: 0,
  },
  backgroundColor = 'red',
  borderRadius = 8,
  duration = 1000,
  parentLayout,
  onAnimationComplete,
}: ExpandableCompProps) => {
  const { width: screenWidth } = Dimensions.get('window')
  
  // Reference to track actual layout measurements
  const [containerWidth, setContainerWidth] = useState(screenWidth)
  
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
      [0, position?.right || 0]
    )
  })
  
  const animatedTranslateY = useDerivedValue(() => {
    return interpolate(
      progress.value,
      [0, 1],
        [0, (-(containerHeight - initialHeight) / 2)-((position?.top || 0)-5)]
    )
  })
  
  // Create animated styles
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: position?.top,
      right: position?.right,
      width: animatedWidth.value,
      height: animatedHeight.value,
      backgroundColor,
      borderRadius,
      transform: [
        { translateX: animatedTranslateX.value },
        { translateY: animatedTranslateY.value },
        { scale: scale.value }
      ]
    }
  })
  
  // Handler function to reset component
  const handleAnimationComplete = () => {
    setVisible(false)
    
    // Reset the component after fade out animation
    setTimeout(() => {
      setExpanded(false)
      progress.value = 0
      
      // Set scale to 0 before showing the element
      scale.value = 0
      
      // Make the component visible again
      setVisible(true)
      
      // Animate scale from 0 to 1 with a spring effect for pop-up
      scale.value = withSpring(1, getPopSpringConfig())
      
      // Call the external callback if provided
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }, 500) // Matches the fade out duration
  }
  
  // Animation function
  const toggleCardSize = () => {
    // Toggle expanded state
    const newExpanded = !expanded
    setExpanded(newExpanded)
    
    if (newExpanded) {
      // Animate to expanded state
      progress.value = withTiming(1, getAnimationConfig(duration), (finished) => {
        if (finished) {
          // Use runOnJS to call our function from the UI thread
          runOnJS(handleAnimationComplete)()
        }
      })
    } else {
      // Animate to collapsed state (should not typically be called directly now)
      progress.value = withTiming(0, getAnimationConfig(duration / 2))
    }
  }

  return (
    <View 
      style={styles.container}
      onLayout={onLayout}
    >
      <TouchableOpacity 
        activeOpacity={1}
        onPress={toggleCardSize}
        style={styles.touchable}
      >
        {visible && (
          <Animated.View
            style={animatedCardStyle}
            exiting={FadeOut.duration(500)}
          >
            {children}
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  )
}

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