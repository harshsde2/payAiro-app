import { BlurMask, Circle, Group, Rect, RoundedRect, Text as SKText, useFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { ChartBounds, ChartPressState } from 'victory-native';
import { ChartDataPoint } from 'tsx-components/performance-chart/types';

interface CryptoTooltipProps {
  x: any;
  y: any;
  chartBounds: ChartBounds;
  state: ChartPressState<{ x: number; y: { y: number } }>;
  currentData: ChartDataPoint[];
  tooltipColor: string;
}

export function CryptoTooltip({
  x,
  y,
  chartBounds,
  state,
  currentData,
  tooltipColor,
}: CryptoTooltipProps) {
  const tooltip = {
    width: 100,
    height: 40,
    paddingX: 8,
    paddingY: 12,
    marginFromCircle: 12,
    edgeBuffer: 8,
  };

  const chartDimensions = {
    width: chartBounds.right - chartBounds.left,
    height: chartBounds.bottom - chartBounds.top,
  };

  const value = useDerivedValue(() => {
    'worklet';
    const val = state.y.y.value.value;
    // Format currency as worklet-compatible code
    const formatted = `$${val.toFixed(2)}`;
    return formatted;
  }, [state]);

  const lineX = useDerivedValue(() => state.x.position.value - 0.5, [state.x.position]);

  const toolTipContainerX = useDerivedValue(() => {
    if (state.x.position.value < tooltip.width / 2) {
      return 0;
    }
    if (state.x.position.value > chartDimensions.width - tooltip.width / 2) {
      return chartDimensions.width - tooltip.width;
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
    if (posY + tooltip.height > chartDimensions.height - tooltip.edgeBuffer) {
      posY = chartDimensions.height - tooltip.height - tooltip.edgeBuffer;
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

  const valueY = useDerivedValue(() => {
    return toolTipContainerY.value + tooltip.paddingY + 14;
  }, [toolTipContainerY]);

  const shadowX = useDerivedValue(() => {
    return x.value - 15;
  }, [x]);

  const shadowY = useDerivedValue(() => {
    return y.value - 5;
  }, [y]);

  // Try to load font, fallback to system font if not available
  // Path from src/screens/TSX-Screens/CybridCrypto/ to assets/fonts/
  const chartFont = useFont(require('../../../../assets/fonts/Montserrat-Regular.ttf'), 11);

  return (
    <Group>
      <Group>
        {/* Vertical line indicator */}
        <Rect
          x={lineX}
          y={chartBounds.top}
          width={1}
          height={chartBounds.bottom - chartBounds.top}
          color={tooltipColor}
          opacity={0.5}
        />
        {/* Dot on line */}
        <Circle cx={x} cy={y} r={4} color={tooltipColor} opacity={1} />
        {/* Glow effect */}
        <Circle cx={shadowX} cy={shadowY} r={10} color={tooltipColor} opacity={0.3}>
          <BlurMask blur={9} style="normal" />
        </Circle>
      </Group>
      <Group style={'fill'}>
        {/* Tooltip background */}
        <RoundedRect
          x={toolTipContainerX}
          y={toolTipContainerY}
          width={tooltip.width}
          height={tooltip.height}
          color="#000000"
          opacity={0.9}
          r={8}
        />
        {/* Tooltip text */}
        <SKText
          x={tooltipTextX}
          y={valueY}
          font={chartFont}
          text={value}
          color="#FFFFFF"
          style={'fill'}
        />
      </Group>
    </Group>
  );
}
