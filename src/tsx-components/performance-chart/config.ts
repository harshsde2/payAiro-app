export const DATA = Array.from({ length: 31 }, (_, i) => ({
  x: i,
  y: 40 + 30 * Math.random(),
}));

export const DATA2 = Array.from({ length: 31 }, (_, i) => ({
  x: i,
  y: 40 + 10 * Math.random(),
}));

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `£${Math.round(value / 1000)}K`;
  }
  return `£${value}`;
};

export const axisOptions = {
  formatYLabel: (value: any) => formatCurrency(value),
  labelColor: '#9CA3AF',
  lineColor: 'transparent',
  tickCount: 5,
  labelOffset: { x: -15, y: 0 },
};

export const padding = { left: 0, right: 0, bottom: 0, top: 0 };

export const xKey = 'x';
export const yKeys = ['y'];

export const currencyIcon = { dollar: '$', pound: '£', euro: '€', yen: '¥' };

export const keys = {
  xKey: xKey,
  yKeys: yKeys,
};
