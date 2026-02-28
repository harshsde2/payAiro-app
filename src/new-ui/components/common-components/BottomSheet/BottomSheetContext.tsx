import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, TouchableWithoutFeedback, BackHandler } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { bottomSheetStyles, BOTTOM_SHEET_CONSTANTS } from '@new-ui/styles/components/bottomSheetStyles';
import {
  IBottomSheetContextValue,
  IBottomSheetProviderProps,
  IBottomSheetConfig,
  SnapPoint,
} from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const { VELOCITY_THRESHOLD, ANIMATION_CONFIG } = BOTTOM_SHEET_CONSTANTS;

const BottomSheetContext = createContext<IBottomSheetContextValue | undefined>(undefined);

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

export const BottomSheetProvider: React.FC<IBottomSheetProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const styles = bottomSheetStyles(theme);

  const [content, setContent] = useState<ReactNode>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<IBottomSheetConfig>({
    snapPoints: ['50%'],
    initialSnapIndex: 0,
    enableDrag: true,
    enableBackdropPress: true,
    backdropOpacity: 0.5,
  });

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const contextY = useSharedValue(0);
  const isOpenRef = useRef(false);
  
  const snapPointsShared = useSharedValue<number[]>([SCREEN_HEIGHT * 0.5]);
  const maxSnapPointShared = useSharedValue(SCREEN_HEIGHT * 0.5);
  const minSnapPointShared = useSharedValue(SCREEN_HEIGHT * 0.5);

  const parsedSnapPoints = React.useMemo(
    () => (config.snapPoints || ['50%']).map(parseSnapPoint).sort((a, b) => a - b),
    [config.snapPoints]
  );

  useEffect(() => {
    snapPointsShared.value = parsedSnapPoints;
    maxSnapPointShared.value = parsedSnapPoints[parsedSnapPoints.length - 1];
    minSnapPointShared.value = parsedSnapPoints[0];
  }, [parsedSnapPoints]);

  const maxSnapPoint = parsedSnapPoints[parsedSnapPoints.length - 1];
  const minSnapPoint = parsedSnapPoints[0];

  const handleCloseComplete = useCallback(() => {
    setIsVisible(false);
    setContent(null);
    isOpenRef.current = false;
    if (config.onClose) {
      config.onClose();
    }
  }, [config.onClose]);

  const closeSheet = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, ANIMATION_CONFIG, (finished) => {
      if (finished) {
        runOnJS(handleCloseComplete)();
      }
    });
  }, [handleCloseComplete]);

  const snapToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= parsedSnapPoints.length) return;
      const destination = SCREEN_HEIGHT - parsedSnapPoints[index];
      translateY.value = withSpring(destination, ANIMATION_CONFIG);
      if (config.onChange) {
        config.onChange(index);
      }
    },
    [parsedSnapPoints, config.onChange]
  );

  const handleOpenComplete = useCallback(() => {
    if (config.onOpen) {
      config.onOpen();
    }
  }, [config.onOpen]);

  const openSheet = useCallback(
    (sheetContent: ReactNode, sheetConfig?: IBottomSheetConfig) => {
      const mergedConfig = { ...config, ...sheetConfig };
      setConfig(mergedConfig);
      setContent(sheetContent);
      setIsVisible(true);
      isOpenRef.current = true;

      const snapPoints = (mergedConfig.snapPoints || ['50%']).map(parseSnapPoint).sort((a, b) => a - b);
      const initialIndex = mergedConfig.initialSnapIndex || 0;
      const destination = SCREEN_HEIGHT - snapPoints[initialIndex];

      snapPointsShared.value = snapPoints;
      maxSnapPointShared.value = snapPoints[snapPoints.length - 1];
      minSnapPointShared.value = snapPoints[0];

      requestAnimationFrame(() => {
        translateY.value = withSpring(destination, ANIMATION_CONFIG, (finished) => {
          if (finished) {
            runOnJS(handleOpenComplete)();
          }
        });
      });
    },
    [handleOpenComplete]
  );

  const expand = useCallback(() => {
    snapToIndex(parsedSnapPoints.length - 1);
  }, [parsedSnapPoints.length, snapToIndex]);

  const collapse = useCallback(() => {
    snapToIndex(0);
  }, [snapToIndex]);

  const handleSnapToIndex = useCallback((index: number) => {
    snapToIndex(index);
  }, [snapToIndex]);

  const gesture = Gesture.Pan()
    .enabled(config.enableDrag !== false)
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
      const snapPoints = snapPointsShared.value;
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
        for (let i = snapPoints.length - 1; i >= 0; i--) {
          if (snapPoints[i] < currentHeight) {
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
        nearestIndex = snapPoints.length - 1;
        for (let i = 0; i < snapPoints.length; i++) {
          if (snapPoints[i] > currentHeight) {
            nearestIndex = i;
            break;
          }
        }
      } else {
        let minDistance = Math.abs(snapPoints[0] - currentHeight);
        for (let i = 1; i < snapPoints.length; i++) {
          const distance = Math.abs(snapPoints[i] - currentHeight);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        }
      }

      const destination = SCREEN_HEIGHT - snapPoints[nearestIndex];
      translateY.value = withSpring(destination, ANIMATION_CONFIG);
      runOnJS(handleSnapToIndex)(nearestIndex);
    });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpenRef.current) {
        closeSheet();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [closeSheet]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT - maxSnapPointShared.value],
      [0, config.backdropOpacity || 0.5],
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

  const handleBackdropPress = useCallback(() => {
    if (config.enableBackdropPress !== false) {
      closeSheet();
    }
  }, [config.enableBackdropPress, closeSheet]);

  const contextValue: IBottomSheetContextValue = {
    open: openSheet,
    close: closeSheet,
    snapToIndex,
    expand,
    collapse,
    isOpen: isOpenRef.current,
  };

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}

      {isVisible && (
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
                { height: maxSnapPoint },
                config.containerStyle,
                containerAnimatedStyle,
              ]}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handleIndicator, config.handleIndicatorStyle]} />
              </View>

              <View style={[styles.contentContainer, config.contentContainerStyle]}>
                {content}
              </View>
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = (): IBottomSheetContextValue => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};
