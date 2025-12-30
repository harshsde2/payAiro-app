interface ColorPair {
  colors: string[];
  lightColors: string[];
}

export const generateColorPairs = (n: number): ColorPair => {
  const colors: string[] = [];
  const lightColors: string[] = [];

  const baseColors = [
    '#2ECC71', // Vibrant green - good contrast on light
    '#E67E22', // Orange - good contrast
    '#3498DB', // Blue - good contrast
    '#9B59B6', // Purple - good contrast
    '#E74C3C', // Red - good contrast
    '#1ABC9C', // Teal - good contrast
    '#F39C12', // Orange-yellow - good contrast
    '#34495E', // Dark blue-grey - good contrast
    '#16A085', // Dark teal - good contrast
    '#D35400', // Dark orange - good contrast
    '#8E44AD', // Dark purple - good contrast
    '#C0392B', // Dark red - good contrast
    '#27AE60', // Medium green - good contrast
    '#2980B9', // Medium blue - good contrast
    '#95A5A6', // Grey - good contrast
  ];

  for (let i = 0; i < n; i++) {
    const mainColor = baseColors[i % baseColors.length];

    colors.push(normalizeHex(mainColor));

    const lightColor = generateLightVersion(mainColor);
    lightColors.push(lightColor);
  }

  return { colors, lightColors };
};

const HEX8_ALPHA_20 = '33';

const normalizeHex = (hexColor: string): string => {
  const value = hexColor.trim().replace(/^#/, '');
  if (/^[0-9A-Fa-f]{3}$/.test(value)) {
    const [r, g, b] = value.split('');
    return `#${(r + r + g + g + b + b).toUpperCase()}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(value)) {
    return `#${value.toUpperCase()}`;
  }
  throw new Error('Invalid HEX color. Expected #RGB or #RRGGBB.');
};

const generateLightVersion = (color: string): string => {
  const hex = normalizeHex(color);
  return `${hex}${HEX8_ALPHA_20}`;
};

export const generateThemedColorPairs = (
  n: number,
  theme: 'vibrant' | 'pastel' | 'monochrome' | 'nature' = 'vibrant',
): ColorPair => {
  const themeColors = {
    vibrant: [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ],
    pastel: [
      '#FFB3BA',
      '#FFDFBA',
      '#FFFFBA',
      '#BAFFC9',
      '#BAE1FF',
      '#E6B3FF',
      '#FFB3E6',
      '#B3FFE6',
      '#FFE6B3',
      '#E6FFB3',
    ],
    monochrome: [
      '#2C3E50',
      '#34495E',
      '#7F8C8D',
      '#95A5A6',
      '#BDC3C7',
      '#D5DBDB',
      '#EBEDEF',
      '#F8F9FA',
      '#E8E8E8',
      '#D0D0D0',
    ],
    nature: [
      '#2ECC71',
      '#27AE60',
      '#16A085',
      '#138D75',
      '#0E6655',
      '#F39C12',
      '#E67E22',
      '#D35400',
      '#A93226',
      '#8E44AD',
    ],
  };

  const colors: string[] = [];
  const lightColors: string[] = [];

  const selectedTheme = themeColors[theme];

  for (let i = 0; i < n; i++) {
    const colorIndex = i % selectedTheme.length;
    const mainColor = selectedTheme[colorIndex];
    colors.push(mainColor);
    lightColors.push(generateLightVersion(mainColor));
  }

  return { colors, lightColors };
};
