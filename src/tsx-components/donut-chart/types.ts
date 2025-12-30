import { SkFont } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

export type DonutChartProps = {
  n: number;
  gap: number;
  radius: number;
  strokeWidth: number;
  outerStrokeWidth: number;
  decimals: SharedValue<number[]>;
  colors: string[];
  totalValue: SharedValue<number>;
  font: SkFont;
  smallFont: SkFont;
  smallFont12: SkFont;
  smallFont10: SkFont;
  smallFont8: SkFont;
  activeIndex: SharedValue<number | null>;
  segmentValues: SharedValue<number[]>;
  segmentLabels: SharedValue<string[]>;
  textColor?: string;
  outerStrokeColor?: string;
};

export type DonutPathProps = {
  strokeWidth: number;
  outerStrokeWidth: number;
  gap: number;
  radius: number;
  color: string;
  decimals: SharedValue<number[]>;
  index: number;
  activeIndex: SharedValue<number | null>;
};

export interface Data {
  value: number;
  percentage: number;
  color: string;
  lightColor: string;
  label?: string;
}

export type RenderItemProps = {
  item: Data;
  index: number;
  activeIndex?: SharedValue<number | null>;
};

export interface DonutChartContainerProps {
  n: number;
  index: number;
  portfolioBreakdownData?: any;
}
