import { SharedValue } from 'react-native-reanimated';
import { ChartBounds, ChartPressState } from 'victory-native';

export interface ToolTipProps {
  state: ChartPressState<{ x: number; y: { y: number } }>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  chartBounds: ChartBounds;
  currentData: ChartDataPoint[];
  selectedPeriodLabel: string;
}

export interface PerformanceDataPoint {
  date: string;
  current_value: number;
  return_percentage: number;
  daily_return: number;
}

export interface PerformancePeriod {
  period: string;
  series: PerformanceDataPoint[];
}

export interface CurrentPerformance {
  current_value: number;
  return_percentage: number;
  last_updated: string;
}

export interface PerformanceApiResponse {
  data: {
    data: {
      current: CurrentPerformance;
      periods: PerformancePeriod[];
    };
    meta: {
      inception_date: string;
      total_days: number;
      cache_status: string;
      computation_version: string;
    };
  };
}

export interface ChartDataPoint extends Record<string, unknown> {
  x: number;
  y: number;
  date?: string;
  return_percentage?: number;
  maxX?: number;
}
