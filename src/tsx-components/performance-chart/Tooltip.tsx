import { useTheme } from 'styles';
import { BlurMask, Circle, Group, Rect, RoundedRect, Text as SKText, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { currencyIcon } from './config';
import { ToolTipProps } from './types';

export function ToolTip({ x, y, chartBounds, state, currentData, selectedPeriodLabel }: ToolTipProps) {
  const { theme } = useTheme();
  const tooltip = {
    width: 100,
    height: 52,
    positionY: 10,
    paddingX: 8,
    paddingY: 12,
    marginFromCircle: 12,
    edgeBuffer: 8, // Minimum distance from chart edges
  };

  const chartDimentions = {
    width: chartBounds.right - chartBounds.left,
    height: chartBounds.bottom - chartBounds.top,
  };

  const value = useDerivedValue(() => {
    return `${currencyIcon.pound} ${Math.round(state.y.y.value.value).toLocaleString('en-GB')}`;
  }, [state]);

  const dateText = useDerivedValue(() => {
    const index = Math.round(state.x.value.value);
    const dataPoint = currentData[index];
    if (dataPoint?.date) {
      return dataPoint.date;
    }
    return '';
  }, [state, currentData]);

  const returnText = useDerivedValue(() => {
    const index = Math.round(state.x.value.value);
    const dataPoint = currentData[index];

    // For index 0 (first point), show "Start" instead of percentage
    if (index === 0) {
      return '— Start';
    }

    // For index >= 1, show the period-cumulative return percentage
    if (dataPoint?.return_percentage !== undefined) {
      const sign = dataPoint.return_percentage >= 0 ? '+' : '';
      return `${sign}${dataPoint.return_percentage.toFixed(2)}% ${selectedPeriodLabel}`;
    }
    return '';
  }, [state, currentData, selectedPeriodLabel]);

  const chartFont = useFont(require('../../../assets/fonts/Montserrat-Regular.ttf'), 11);

  const lineX = useDerivedValue(() => state.x.position.value - 0.5, [state.x.position]);

  // console.log('chart bound =>', JSON.stringify(chartBounds, null, 2));

  const toolTipContainerX = useDerivedValue(() => {
    if (state.x.position.value < tooltip.width / 2) {
      return 0;
    }
    if (state.x.position.value > chartDimentions.width - tooltip.width / 2) {
      return chartDimentions.width - tooltip.width;
    }
    const val = state.x.position.value - tooltip.width / 2;
    return val;
  }, [state.x.position]);

  const toolTipContainerY = useDerivedValue(() => {
    'worklet';
    const pointY = state.y.y.position.value;

    // Try to position above the point first
    let posY = pointY - tooltip.height - tooltip.marginFromCircle;

    // If too close to top, position below the point
    if (posY < tooltip.edgeBuffer) {
      posY = pointY + tooltip.marginFromCircle;
    }

    // If now too close to bottom, clamp it
    if (posY + tooltip.height > chartDimentions.height - tooltip.edgeBuffer) {
      posY = chartDimentions.height - tooltip.height - tooltip.edgeBuffer;
    }

    // Final safety: ensure it's not above top edge
    if (posY < tooltip.edgeBuffer) {
      posY = tooltip.edgeBuffer;
    }

    return posY;
  }, [state.y.y.position]);

  const tooltipTextX = useDerivedValue(() => {
    return toolTipContainerX.value + tooltip.paddingX;
  }, [toolTipContainerX]);

  const dateY = useDerivedValue(() => {
    return toolTipContainerY.value + tooltip.paddingY;
  }, [toolTipContainerY]);

  const valueY = useDerivedValue(() => {
    return dateY.value + 13;
  }, [dateY]);

  const returnY = useDerivedValue(() => {
    return valueY.value + 13;
  }, [valueY]);

  const shadowX = useDerivedValue(() => {
    return x.value - 15;
  }, [x]);

  const shadowY = useDerivedValue(() => {
    return y.value - 5;
  }, [y]);

  const lineShadowX = useDerivedValue(() => {
    return lineX.value - 15;
  }, [lineX]);
  const lineShadowY = useDerivedValue(() => {
    return chartBounds.top;
  }, [chartBounds.top]);

  return (
    <Group>
      <Group>
        {/* <Rect
          x={lineShadowX}
          y={lineShadowY}
          width={1}
          height={chartBounds.bottom - chartBounds.top}
          color={colors.cardGradientTertiary}
          opacity={0.5}>
          <BlurMask blur={2} style="normal" />
        </Rect> */}
        <Rect
          x={lineX}
          y={chartBounds.top}
          width={1}
          height={chartBounds.bottom - chartBounds.top}
          color={theme.colors.palette.accent}
          opacity={1}
        />
        <Circle cx={x} cy={y} r={4} color={theme.colors.palette.accent} opacity={1} />
        <Circle
          cx={shadowX}
          cy={shadowY}
          r={10} // make it larger than main dot
          color={theme.colors.palette.accent}
          opacity={0.9} // softer opacity for glow
        >
          <BlurMask blur={9} style="normal" />
        </Circle>
      </Group>
      <Group style={'fill'}>
        <RoundedRect
          x={toolTipContainerX}
          y={toolTipContainerY}
          width={tooltip.width}
          height={tooltip.height}
          color={theme.colors.palette.accent}
          opacity={0.9}
          r={20}
        />
        <SKText x={tooltipTextX} y={dateY} font={chartFont} text={dateText} color={theme.colors.text.tertiary} style={'fill'} />
        <SKText x={tooltipTextX} y={valueY} font={chartFont} text={value} color={theme.colors.text.primary} style={'fill'} />
        <SKText x={tooltipTextX} y={returnY} font={chartFont} text={returnText} color={theme.colors.text.tertiary} style={'fill'} />
      </Group>
    </Group>
  );
}
