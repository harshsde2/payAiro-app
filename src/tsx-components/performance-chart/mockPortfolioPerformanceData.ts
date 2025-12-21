import type { PerformanceData } from './usePortfolioPerformance';

const generateDateSeries = (
  days: number,
  baseValue: number,
  startDate?: Date,
): Array<{
  date: string;
  current_value: number;
  return_percentage: number;
  daily_return: number;
}> => {
  const series = [];
  const now = startDate || new Date();

  let currentValue = baseValue * 0.9;
  let cumulativeReturn = -10;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dailyVariation = (Math.random() - 0.48) * 0.015;
    const dailyReturn = dailyVariation * 100;

    currentValue = currentValue * (1 + dailyVariation);
    cumulativeReturn = (currentValue / (baseValue * 0.9) - 1) * 100;

    series.push({
      date: date.toISOString(),
      current_value: Math.round(currentValue * 100) / 100,
      return_percentage: Math.round(cumulativeReturn * 100) / 100,
      daily_return: Math.round(dailyReturn * 100) / 100,
    });
  }

  return series;
};

const baseValue = 125000;
const now = new Date();

const todaySeries = generateDateSeries(2, baseValue, now);
const currentReturn =
  todaySeries.length > 0
    ? (todaySeries[todaySeries.length - 1].current_value / todaySeries[0].current_value - 1) * 100
    : 5.23;

export const mockPerformanceData: PerformanceData = {
  current: {
    current_value: baseValue,
    return_percentage: Math.round(currentReturn * 100) / 100,
    last_updated: now.toISOString(),
  },
  periods: [
    {
      period: '1D',
      series: todaySeries,
    },
    {
      period: '1W',
      series: generateDateSeries(7, baseValue, now),
    },
    {
      period: '1M',
      series: generateDateSeries(30, baseValue, now),
    },
    {
      period: 'YTD',
      series: generateDateSeries(180, baseValue, now),
    },
    {
      period: '1Y',
      series: generateDateSeries(365, baseValue, now),
    },
    {
      period: 'Max',
      series: generateDateSeries(730, baseValue, now),
    },
  ],
};
