import { StyleProp, ViewStyle } from 'react-native';

export interface IGlassyWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Border radius for rounded corners. Use half of width/height for a circle. */
  borderRadius?: number;
  /** Blur intensity (1–100). Default 15. */
  blurAmount?: number;
  /** 'light' | 'dark' | 'regular' | 'prominent' | 'extraLight' | 'systemMaterial'. Default 'light'. */
  blurType?: 'light' | 'dark' | 'regular' | 'prominent' | 'extraLight' | 'systemMaterial';
  /** Overlay tint opacity (0–1). Higher = more opaque. Default 0.15. */
  overlayOpacity?: number;
  /** Optional border for subtle edge highlight. */
  borderWidth?: number;
  /** Border color. Default semi-transparent white. */
  borderColor?: string;
  /** Padding around children. Default 0. */
  padding?: number;
  /** Show glossy highlight (white crescent on top-left). Default true. */
  showGlossyHighlight?: boolean;
}
