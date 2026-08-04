import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import type { ILimitBarProps } from './types';

/** Bar turns amber as the user approaches the cap and red once it's exceeded. */
const NEAR_LIMIT_RATIO = 0.8;
export const LIMIT_BAR_HEIGHT = 6;

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: LIMIT_BAR_HEIGHT,
    borderRadius: LIMIT_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: LIMIT_BAR_HEIGHT / 2,
  },
});

/**
 * The single usage-bar primitive for every limits surface (amount entry meters and
 * the Transaction Limits screen). Owns the fill ratio and the colour thresholds so
 * every bar in the app reads identically.
 */
const LimitBar: React.FC<ILimitBarProps> = ({
  usedUsd,
  limitUsd,
  pendingUsd = 0,
  over = false,
  style,
}) => {
  const { theme } = useTheme();

  const { ratio, color } = useMemo(() => {
    const pending = Number.isFinite(pendingUsd) && pendingUsd > 0 ? pendingUsd : 0;
    const used = Number.isFinite(usedUsd) && usedUsd > 0 ? usedUsd : 0;
    const raw = limitUsd > 0 ? (used + pending) / limitUsd : 0;

    return {
      ratio: Math.max(0, Math.min(1, raw)),
      color:
        over || raw > 1
          ? theme.colors.error
          : raw >= NEAR_LIMIT_RATIO
            ? theme.colors.warning
            : theme.colors.primary,
    };
  }, [
    limitUsd,
    over,
    pendingUsd,
    theme.colors.error,
    theme.colors.primary,
    theme.colors.warning,
    usedUsd,
  ]);

  return (
    <View
      style={[styles.track, { backgroundColor: theme.colors.greenLight2 }, style]}
    >
      <View
        style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]}
      />
    </View>
  );
};

export default LimitBar;
