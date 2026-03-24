export const COLORS = {
  primary: '#00793F',
  secondary: '#2FBC39',
  tertiary: '#81EB7F',
  greenLight1: '#B8F5B6',
  greenLight2: '#D9FAD8',
  grey: '#9B9B9B',
  greyLight: '#F5F5F5',
  greyDark: '#838383',
  greyLight2: '#CCCCCC',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof COLORS;

