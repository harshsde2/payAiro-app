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

    const transformToSeries = (data: CryptoPricePoint[]) => {
      if (!data || data.length === 0) return [];

      const firstPrice = data[0].y;
      return data.map((point, idx) => {
        const returnPercentage =
          firstPrice > 0 ? ((point.y - firstPrice) / firstPrice) * 100 : 0;

        return {
          date:
            point.date ||
            new Date(now.getTime() - (data.length - idx) * 60 * 60 * 1000).toISOString(),
          current_value: point.y,
          return_percentage: returnPercentage,
          daily_return:
            idx > 0 ? ((point.y - data[idx - 1].y) / data[idx - 1].y) * 100 : 0,
        };
      });
    };

    const series = transformToSeries(priceData);

    return {
      current: {
        current_value: currentPrice,
        return_percentage: priceChange,
        last_updated: now.toISOString(),
      },
      periods: [
        {
          period: 'chart',
          series,
        },
      ],
    };
  }, [priceData, currentPrice, priceChange]);

  return {
    performanceData,
    isLoading: false,
    error: null,
  };
};
