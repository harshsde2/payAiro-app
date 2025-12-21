import { useMemo } from 'react';
import { mockPerformanceData } from './mockPortfolioPerformanceData';

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

export interface PerformanceData {
  current: CurrentPerformance;
  periods: PerformancePeriod[];
}

interface PerformanceApiResponse {
  data: {
    data: PerformanceData;
    meta: {
      inception_date: string;
      total_days: number;
      cache_status: string;
      computation_version: string;
    };
  };
}

export const usePortfolioPerformance = () => {
  const performanceData = useMemo(() => mockPerformanceData, []);
  const isLoading = false;
  const error = null;

  const fetchPerformanceData = async () => {
    // Using mock data directly - no API call needed
    // TODO: Replace with actual API call when ready
    /*
    import ApiService from '@/api';
    import endpoints from '@/api/endpoints';

    try {
      const response = (await ApiService.get(
        endpoints.analytics.portfolioPerformance,
      )) as unknown as PerformanceApiResponse;

      if (response?.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      throw err;
    }
    */
  };

  return {
    performanceData,
    isLoading,
    error,
    fetchPerformanceData,
  };
};
