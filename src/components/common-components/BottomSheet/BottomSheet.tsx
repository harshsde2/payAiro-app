import React, { forwardRef, useImperativeHandle, useCallback, useMemo, useEffect } from 'react';
import { View, TouchableWithoutFeedback, BackHandler } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@styles/ThemeContext';
import { bottomSheetStyles, BOTTOM_SHEET_CONSTANTS } from '@styles/components/bottomSheetStyles';
import { IBottomSheetProps, IBottomSheetRef, SnapPoint } from './types';

const { SCREEN_HEIGHT, VELOCITY_THRESHOLD, ANIMATION_CONFIG } = BOTTOM_SHEET_CONSTANTS;

const parseSnapPoint = (snapPoint: SnapPoint): number => {
  'worklet';
  if (typeof snapPoint === 'number') {
    return snapPoint;
  }
  if (typeof snapPoint === 'string' && snapPoint.endsWith('%')) {
    const percentage = parseFloat(snapPoint) / 100;
    return SCREEN_HEIGHT * percentage;
  }
  return SCREEN_HEIGHT * 0.5;
};

const BottomSheet = forwardRef<IBottomSheetRef, IBottomSheetProps>(
  (
    {
      children,
      snapPoints = ['50%'],
      initialSnapIndex = 0,
      enableDrag = true,
      enableBackdropPress = true,
      backdropOpacity = 0.5,
      handleIndicatorStyle,
      containerStyle,
      contentContainerStyle,
      onOpen,
      onClose,
      onChange,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const styles = bottomSheetStyles(theme);

    const parsedSnapPoints = useMemo(
      () => snapPoints.map(parseSnapPoint).sort((a, b) => a - b),
      [snapPoints]
    );

    const maxSnapPoint = parsedSnapPoints[parsedSnapPoints.length - 1];
    const minSnapPoint = parsedSnapPoints[0];

    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contextY = useSharedValue(0);
    const isOpen = useSharedValue(false);
    const currentSnapIndex = useSharedValue(-1);
    
    const snapPointsShared = useSharedValue<number[]>(parsedSnapPoints);
    const maxSnapPointShared = useSharedValue(maxSnapPoint);
    const minSnapPointShared = useSharedValue(minSnapPoint);

    useEffect(() => {
      snapPointsShared.value = parsedSnapPoints;
      maxSnapPointShared.value = maxSnapPoint;
      minSnapPointShared.value = minSnapPoint;
    }, [parsedSnapPoints, maxSnapPoint, minSnapPoint]);

    const handleCloseComplete = useCallback(() => {
      isOpen.value = false;
      currentSnapIndex.value = -1;
      if (onClose) {
        onClose();
      }
    }, [onClose]);

    const handleSnapChange = useCallback((index: number) => {
      if (onChange) {
        onChange(index);
      }
    }, [onChange]);

    const handleOpenComplete = useCallback(() => {
      if (onOpen) {
        onOpen();
      }
    }, [onOpen]);

    const snapToIndex = useCallback(
      (index: number) => {
        if (index < 0 || index >= parsedSnapPoints.length) return;
        
        const destination = SCREEN_HEIGHT - parsedSnapPoints[index];
        translateY.value = withSpring(destination, ANIMATION_CONFIG);
        currentSnapIndex.value = index;
        
        if (onChange) {
          onChange(index);
        }
      },
      [parsedSnapPoints, onChange]
    );

    const close = useCallback(() => {
      translateY.value = withSpring(SCREEN_HEIGHT, ANIMATION_CONFIG, (finished) => {
        if (finished) {
          runOnJS(handleCloseComplete)();
        }
      });
    }, [handleCloseComplete]);

    const open = useCallback(
      (index: number = initialSnapIndex) => {
        isOpen.value = true;
        const destination = SCREEN_HEIGHT - parsedSnapPoints[index];
        translateY.value = withSpring(destination, ANIMATION_CONFIG, (finished) => {
          if (finished) {
            currentSnapIndex.value = index;
            runOnJS(handleOpenComplete)();
          }
        });
      },
      [parsedSnapPoints, initialSnapIndex, handleOpenComplete]
    );

    const expand = useCallback(() => {
      snapToIndex(parsedSnapPoints.length - 1);
    }, [parsedSnapPoints.length, snapToIndex]);

    const collapse = useCallback(() => {
      snapToIndex(0);
    }, [snapToIndex]);

    const gesture = Gesture.Pan()
      .enabled(enableDrag)
      .onStart(() => {
        'worklet';
        contextY.value = translateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        const newY = contextY.value + event.translationY;
        const minY = SCREEN_HEIGHT - maxSnapPointShared.value;
        const maxY = SCREEN_HEIGHT;

        if (newY < minY) {
          const overscroll = minY - newY;
          translateY.value = minY - overscroll * 0.15;
        } else if (newY > maxY) {
          translateY.value = maxY;
        } else {
          translateY.value = newY;
        }
      })
      .onEnd((event) => {
        'worklet';
        const currentHeight = SCREEN_HEIGHT - translateY.value;
        const snapPointsArr = snapPointsShared.value;
        const minSnap = minSnapPointShared.value;
        
        const shouldClose = 
          translateY.value > SCREEN_HEIGHT - minSnap * 0.5 ||
          (event.velocityY > VELOCITY_THRESHOLD && translateY.value > SCREEN_HEIGHT - minSnap);

        if (shouldClose) {
          translateY.value = withSpring(SCREEN_HEIGHT, ANIMATION_CONFIG, (finished) => {
            if (finished) {
              runOnJS(handleCloseComplete)();
            }
          });
          return;
        }

        let nearestIndex = 0;

        if (event.velocityY > VELOCITY_THRESHOLD) {
          for (let i = snapPointsArr.length - 1; i >= 0; i--) {
            if (snapPointsArr[i] < currentHeight) {
              nearestIndex = i;
              break;
            }
          }
          if (nearestIndex < 0) {
            translateY.value = withSpring(SCREEN_HEIGHT, ANIMATION_CONFIG, (finished) => {
              if (finished) {
                runOnJS(handleCloseComplete)();
              }
            });
            return;
          }
        } else if (event.velocityY < -VELOCITY_THRESHOLD) {
          nearestIndex = snapPointsArr.length - 1;
          for (let i = 0; i < snapPointsArr.length; i++) {
            if (snapPointsArr[i] > currentHeight) {
              nearestIndex = i;
              break;
            }
          }
        } else {
          let minDistance = Math.abs(snapPointsArr[0] - currentHeight);
          for (let i = 1; i < snapPointsArr.length; i++) {
            const distance = Math.abs(snapPointsArr[i] - currentHeight);
            if (distance < minDistance) {
              minDistance = distance;
              nearestIndex = i;
            }
          }
        }

        const destination = SCREEN_HEIGHT - snapPointsArr[nearestIndex];
        translateY.value = withSpring(destination, ANIMATION_CONFIG);
        currentSnapIndex.value = nearestIndex;
        runOnJS(handleSnapChange)(nearestIndex);
      });

    useImperativeHandle(ref, () => ({
      open: () => open(initialSnapIndex),
      close,
      snapToIndex: (index: number) => snapToIndex(index),
      expand,
      collapse,
      isOpen: isOpen.value,
    }));

    useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isOpen.value) {
          close();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }, [close, isOpen]);

    const backdropAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateY.value,
        [SCREEN_HEIGHT, SCREEN_HEIGHT - maxSnapPointShared.value],
        [0, backdropOpacity],
        Extrapolation.CLAMP
      );

      return {
        opacity,
        pointerEvents: translateY.value < SCREEN_HEIGHT ? 'auto' : 'none',
      };
    });

    const containerAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    const sheetHeight = useMemo(() => maxSnapPoint, [maxSnapPoint]);

    const handleBackdropPress = useCallback(() => {
      if (enableBackdropPress) {
        close();
      }
    }, [enableBackdropPress, close]);

    return (
      <>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.container,
              { height: sheetHeight },
              containerStyle,
              containerAnimatedStyle,
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={[styles.handleIndicator, handleIndicatorStyle]} />
            </View>

            <View style={[styles.contentContainer, contentContainerStyle]}>
              {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
