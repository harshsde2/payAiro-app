import { ViewStyle, ScrollViewProps } from 'react-native';
import { ReactNode } from 'react';

export type GradientType = 'linear' | 'radial' | 'none';

export interface IPaddingObject {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  horizontal?: number;
  vertical?: number;
}

export interface IGradientPoint {
  x: number;
  y: number;
}

export interface IScreenWrapperProps {
  children: ReactNode;
  
  safeArea?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  
  gradient?: GradientType;
  gradientColors?: string[];
  gradientStart?: IGradientPoint;
  gradientEnd?: IGradientPoint;
  gradientCenter?: IGradientPoint;
  gradientRadius?: number;
  /** Normalized stops (0–1) for Skia radial gradients; length must match `gradientColors` when set. */
  gradientPositions?: number[];

  padding?: number | IPaddingObject;
  paddingHorizontal?: number;
  paddingVertical?: number;
  
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
  contentContainerStyle?: ViewStyle;
  
  backgroundColor?: string;
  backgroundElement?: ReactNode;
  
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarHidden?: boolean;
  
  contentStyle?: ViewStyle;
  flex?: number;
  
  loading?: boolean;
  loadingComponent?: ReactNode;
  
  style?: ViewStyle;
}
