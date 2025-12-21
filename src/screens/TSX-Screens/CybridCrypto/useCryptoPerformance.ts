import { useMemo } from 'react';
import type { PerformanceData } from 'tsx-components/performance-chart/usePortfolioPerformance';

interface CryptoPricePoint {
  x: number;
  y: number;
  date?: string;
}

interface UseCryptoPerformanceProps {
  priceData: CryptoPricePoint[];
  currentPrice: number;
  priceChange: number;
}

export const useCryptoPerformance = ({
  priceData,
  currentPrice,
  priceChange,
}: UseCryptoPerformanceProps): {
  performanceData: PerformanceData | null;
  isLoading: boolean;
  error: string | null;
} => {
  const performanceData = useMemo(() => {
    if (!priceData || priceData.length === 0) return null;

    const now = new Date();

    // Transform crypto price data to PerformanceData format
    const transformToSeries = (data: CryptoPricePoint[], period: string) => {
      if (!data || data.length === 0) return [];
      
      const firstPrice = data[0].y;
      return data.map((point, idx) => {
        const returnPercentage = firstPrice > 0 
          ? ((point.y - firstPrice) / firstPrice) * 100 
          : 0;
        
        return {
          date: point.date || new Date(now.getTime() - (data.length - idx) * 24 * 60 * 60 * 1000).toISOString(),
          current_value: point.y,
          return_percentage: returnPercentage,
          daily_return: idx > 0 ? ((point.y - data[idx - 1].y) / data[idx - 1].y) * 100 : 0,
        };
      });
    };

    // Calculate data slices based on available data points
    const totalPoints = priceData.length;
    const oneDayPoints = Math.min(24, totalPoints); // Approximate 1 day (24 hours)
    const oneWeekPoints = Math.min(168, totalPoints); // Approximate 1 week (7 days * 24 hours)
    const oneMonthPoints = Math.min(720, totalPoints); // Approximate 1 month (30 days * 24 hours)
    const oneYearPoints = Math.min(8760, totalPoints); // Approximate 1 year (365 days * 24 hours)

    // Create periods based on available data
    const periods = [
      {
        period: '1D',
        series: transformToSeries(priceData.slice(-oneDayPoints), '1D'),
      },
      {
        period: '1W',
        series: transformToSeries(priceData.slice(-oneWeekPoints), '1W'),
      },
      {
        period: '1M',
        series: transformToSeries(priceData.slice(-oneMonthPoints), '1M'),
      },
      {
        period: '1Y',
        series: transformToSeries(priceData.slice(-oneYearPoints), '1Y'),
      },
      {
        period: 'All',
        series: transformToSeries(priceData, 'All'),
      },
    ];

    return {
      current: {
        current_value: currentPrice,
        return_percentage: priceChange,
        last_updated: now.toISOString(),
      },
      periods,
    };
  }, [priceData, currentPrice, priceChange]);

  return {
    performanceData,
    isLoading: false,
    error: null,
  };
};
