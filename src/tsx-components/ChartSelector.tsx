import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

export type ChartType = 'pnl' | 'assets';
export type TimeframeType = 'day' | 'week' | 'month' | 'year';

interface ChartSelectorProps {
  selectedChart: ChartType;
  timeframe: TimeframeType;
  onChartTypeChange: (type: ChartType) => void;
  onTimeframePress: () => void;
  downArrowSvg: string;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({
  selectedChart,
  timeframe,
  onChartTypeChange,
  onTimeframePress,
  downArrowSvg
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartTypeContainer}>
        <TouchableOpacity
          onPress={() => onChartTypeChange('pnl')}
          style={[
            styles.chartTypeButton,
            selectedChart === 'pnl' && styles.activeChartButton
          ]}
        >
          <CustomText
            variant="button"
            color={theme.colors.palette.white}
            style={styles.buttonText}
          >
            PnL(%)
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChartTypeChange('assets')}
          style={[
            styles.chartTypeButton,
            selectedChart === 'assets' && styles.activeChartButton,
            styles.middleButton
          ]}
        >
          <CustomText
            variant="button"
            color={theme.colors.palette.white}
            style={styles.buttonText}
          >
            Assets
          </CustomText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onTimeframePress}
        style={styles.timeframeButton}
      >
        <CustomText
          variant="button"
          color={theme.colors.palette.black}
          style={styles.timeframeText}
        >
          {capitalizeFirstLetter(timeframe)}{' '}
          <SvgXml xml={downArrowSvg} width={12} height={12} />
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.spacing.sm,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 2,
  },
  chartTypeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: 30,
    width: 90,
    alignItems: 'center',
  },
  activeChartButton: {
    backgroundColor: theme.colors.palette.green700,
  },
  middleButton: {
    marginLeft: theme.spacing.spacing.sm,
  },
  buttonText: {
    fontSize: 12,
  },
  timeframeButton: {
    backgroundColor: theme.colors.palette.white,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: theme.spacing.spacing.md,
  },
  timeframeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  }
});

export default ChartSelector; 