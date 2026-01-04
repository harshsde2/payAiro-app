interface ColorPair {
  colors: string[];
  lightColors: string[];
}

// Modern vibrant color palette - each color is distinctly different (no similar shades)
// First 6 colors are maximally distinct for common use cases
const APP_THEME_COLORS = [
  '#6366F1', // Indigo - Blue-purple (cool blue)
  // '#EC4899', // Pink - Vibrant pink/magenta (warm pink)
  // '#F59E0B', // Amber - Warm golden yellow (yellow-orange)
  // '#10B981', // Emerald - Vibrant teal-green (green)
  '#EF4444', // Red - Bright red (pure red)
  '#06B6D4', // Cyan - Bright cyan (blue-green, distinct from indigo and emerald)
  '#F97316', // Orange - Vibrant orange (pure orange, distinct from amber)
  '#8B5CF6', // Purple - Rich purple (distinct from indigo)
  '#84CC16', // Lime - Vibrant lime green (yellow-green, distinct from emerald)
  '#F43F5E', // Rose - Vibrant rose (pink-red, distinct from pink and red)
  '#14B8A6', // Teal - Vibrant teal (blue-green, distinct from emerald and cyan)
  '#A855F7', // Violet - Rich violet (purple, distinct from purple and indigo)
];

export const generateColorPairs = (n: number): ColorPair => {
  const colors: string[] = [];
  const lightColors: string[] = [];

  for (let i = 0; i < n; i++) {
    const mainColor = APP_THEME_COLORS[i % APP_THEME_COLORS.length];

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
