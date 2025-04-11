import { StyleProp, ViewStyle } from 'react-native';
import React from 'react';

// Common animation direction type
export type AnimationDirection = 'left' | 'right' | 'up' | 'down' | 'custom';

// Common position type
export interface Position {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
}

// Base props for all animation components
export interface BaseAnimationProps {
  children: React.ReactNode;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationComplete?: () => void;
}

// Props for Slide component
export interface SlideProps extends BaseAnimationProps {
  visible: boolean;
  direction?: AnimationDirection;
  distance?: number;
  customX?: number;
  customY?: number;
}

// Props for GhostSlide component
export interface GhostSlideProps extends SlideProps {
  ghostOpacity?: number;
}

// Props for FadeWrapper component
export interface FadeWrapperProps extends BaseAnimationProps {
  visible?: boolean;
  onComplete?: () => void;
  fadeInOut?: boolean;
  fadeOutDuration?: number;
  fadeInDuration?: number;
  onFadeOutComplete?: () => void;
}

// Props for ExpandableComp component
export interface ExpandableCompProps extends BaseAnimationProps {
  initialWidth?: number;
  initialHeight?: number;
  containerHeight?: number;
  position?: Position;
  backgroundColor?: string;
  borderRadius?: number;
  parentLayout?: { width: number; height: number } | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
} 