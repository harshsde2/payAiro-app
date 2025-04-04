import { Easing } from 'react-native-reanimated';
import { AnimationDirection } from './types';

/**
 * Get the initial X translation value based on direction and distance
 * @param direction The animation direction
 * @param distance The animation distance
 * @param customX The custom X value (used when direction is 'custom')
 * @returns The initial X translation value
 */
export const getInitialTranslateX = (
  direction: AnimationDirection,
  distance: number,
  customX: number = 0
): number => {
  if (direction === 'custom') return customX;
  return direction === 'left' ? -distance : direction === 'right' ? distance : 0;
};

/**
 * Get the initial Y translation value based on direction and distance
 * @param direction The animation direction
 * @param distance The animation distance
 * @param customY The custom Y value (used when direction is 'custom')
 * @returns The initial Y translation value
 */
export const getInitialTranslateY = (
  direction: AnimationDirection,
  distance: number,
  customY: number = 0
): number => {
  if (direction === 'custom') return customY;
  return direction === 'up' ? -distance : direction === 'down' ? distance : 0;
};

/**
 * Get common animation configuration
 * @param duration The animation duration in milliseconds
 * @returns Animation configuration object
 */
export const getAnimationConfig = (duration: number) => {
  return {
    duration,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };
};

/**
 * Get spring animation configuration for pop effect
 * @returns Spring animation configuration object
 */
export const getPopSpringConfig = () => {
  return {
    damping: 8,
    stiffness: 100,
    mass: 0.5,
  };
}; 