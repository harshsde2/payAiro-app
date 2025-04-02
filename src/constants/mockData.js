import {SVGBit, SVGEth, SVGFailGraph, SVGSuGrph, SVGUSDT} from './images';

export const BASE_URL = `https://app.payairo.com/api/`;
export const CRYPTO_HOLDINGS = [
  {
    name: 'Bitcoin',
    holding: '23,073.90',
    current: '$59,980.00',
    invested: '($1,05,998)',
    icon: SVGSuGrph,
  },
  {
    name: 'Polygon',
    holding: '23,073.90',
    current: '$59,545.00',
    invested: '($1,05,998)',
    icon: SVGFailGraph,
  },
  {
    name: 'Dogecoin',
    holding: '23,073.90',
    current: '$59,545.00',
    invested: '($1,05,998)',
    icon: SVGFailGraph,
  },
  {
    name: 'Tether',
    holding: '23,073.90',
    current: '$39,545.00',
    invested: '($1,05,998)',
    icon: SVGSuGrph,
  },
  {
    name: 'Binance',
    holding: '23,073.90',
    current: '$39,90.00',
    invested: '($1,05,998)',
    icon: SVGFailGraph,
  },
];

export const COIN_LISTS = [
  {
    name: 'USDT',
    icon: SVGUSDT,
    value: '90.01',
    type: 'trending',
    loss: true,
    growth: '-19.07',
  },
  {
    name: 'BTC',
    icon: SVGBit,
    value: '50.01',
    type: 'trending',
    loss: false,
    growth: '13.47',
  },
  {
    name: 'ETH',
    icon: SVGEth,
    value: '33.01',
    type: 'trending',
    loss: true,
    growth: '-20.05',
  },
  {
    name: 'USDT',
    icon: SVGUSDT,
    value: '90.01',
    type: 'traded',
    loss: true,
    growth: '-19.07',
  },
  {
    name: 'BTC',
    icon: SVGBit,
    value: '50.01',
    type: 'traded',
    loss: false,
    growth: '13.07',
  },
  {
    name: 'ETH',
    icon: SVGEth,
    value: '33.01',
    type: 'traded',
    loss: true,
    growth: '-20.05',
  },
  {
    name: 'USDT',
    icon: SVGUSDT,
    value: '90.01',
    type: 'cap',
    loss: true,
    growth: '-19.07',
  },
  {
    name: 'BTC',
    icon: SVGBit,
    value: '50.01',
    type: 'cap',
    loss: false,
    growth: '13.47',
  },
  {
    name: 'ETH',
    icon: SVGEth,
    value: '33.01',
    type: 'cap',
    loss: true,
    growth: '-20.45',
  },
];

export const HOLDINDS_DETAILS = [
  {
    label: 'Previous Close',
    value: '17,32',
  },
  {
    label: 'Avg. trade price',
    value: '17,32.49',
  },
  {
    label: 'Last traded at quantity',
    value: '17,32.49',
  },
  {
    label: 'Last traded at',
    value: '12025-02-22 11:11:22',
  },
  {
    label: 'Lower circuit',
    value: '17,32.890',
  },
];
export const DEPOSIT_INFO = [
  {label: 'Deposit to', value: 'Spot Wallet'},
  {label: 'Minimum deposit', value: '>0.00000002 BTC'},
  {label: 'Credited (Trading enabled)', value: '15 Confirmation(s)'},
  {label: 'Unlocked (Withdrawal enabled)', value: '15 Confirmation(s)'},
  {label: 'Note 1', value: 'Do not transact with sanctioned entities.'},
  {label: 'Note 2', value: "Don't send NFTs to this address."},
];
