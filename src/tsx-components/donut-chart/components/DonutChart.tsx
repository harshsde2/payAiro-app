import { Canvas, Group, Path, Skia, Text } from '@shopify/react-native-skia';
import { GestureResponderEvent, View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { styles } from '../styles';
import { DonutChartProps } from '../types';
import DonutPath from './DonutPath';

const DonutChart = ({
  n,
  gap,
  decimals,
  colors,
  totalValue,
  strokeWidth,
  outerStrokeWidth,
  radius,
  font,
  smallFont,
  smallFont12,
  smallFont10,
  smallFont8,
  activeIndex,
  segmentValues,
  segmentLabels,
  textColor = '#000000',
  outerStrokeColor = '#E5E7EB',
}: DonutChartProps) => {
  const array = Array.from({ length: n });
  const innerRadius = radius - outerStrokeWidth / 2;

  const handleTouchRelease = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const x = locationX - radius;
    const y = locationY - radius;
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const isWithinRing =
      distanceFromCenter >= innerRadius - strokeWidth / 2 && distanceFromCenter <= innerRadius + strokeWidth / 2;

    if (!isWithinRing) {
      return;
    }

    let angle = Math.atan2(y, x);
    if (angle < 0) angle += 2 * Math.PI;
    const normalized = angle / (2 * Math.PI);

    let hitIndex = -1;

    for (let i = 0; i < n; i++) {
      let segmentStart: number;
      if (i === 0) {
        segmentStart = gap;
      } else {
        const decimal = decimals.value.slice(0, i);
        const sum = decimal.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        segmentStart = sum + gap;
      }

      let segmentEnd: number;
      if (i === decimals.value.length - 1) {
        segmentEnd = 1;
      } else {
        const decimal = decimals.value.slice(0, i + 1);
        const sum = decimal.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        segmentEnd = sum;
      }

      if (normalized >= segmentStart && normalized <= segmentEnd) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex !== -1) {
      activeIndex.value = hitIndex;
    }
  };

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  const targetText = useDerivedValue(() => {
    if (activeIndex.value !== null && activeIndex.value >= 0 && activeIndex.value < segmentValues.value.length) {
      const value = Math.round(segmentValues.value[activeIndex.value]);
      const formatted = value.toLocaleString('en-US');
      return `$${formatted}`;
    }
    const value = Math.round(totalValue.value);
    const formatted = value.toLocaleString('en-US');
    return `$${formatted}`;
  }, []);

  const fontSize = font.measureText('£00');
  const smallFontSize = smallFont.measureText('Total Spent');

  const labelText = useDerivedValue(() => {
    if (activeIndex.value !== null && activeIndex.value >= 0 && activeIndex.value < segmentLabels.value.length) {
      return segmentLabels.value[activeIndex.value];
    }
    return 'Total';
  }, []);

  // Reduced maxLabelWidth to prevent overflow and ensure labels don't affect chart layout
  const maxLabelWidth = (radius - outerStrokeWidth / 2) * 1.4;

  const labelFontIndex = useDerivedValue(() => {
    'worklet';
    const text = labelText.value;
    const width15 = smallFont.measureText(text).width;
    if (width15 <= maxLabelWidth) {
      return 0;
    }
    const width12 = smallFont12.measureText(text).width;
    if (width12 <= maxLabelWidth) {
      return 1;
    }
    const width10 = smallFont10.measureText(text).width;
    if (width10 <= maxLabelWidth) {
      return 2;
    }
    const width8 = smallFont8.measureText(text).width;
    if (width8 <= maxLabelWidth) {
      return 3;
    }
    // If even smallest font doesn't fit, we'll truncate with font index 3
    return 3;
  }, []);
  
  // Truncated label text that fits within maxLabelWidth
  const truncatedLabelText = useDerivedValue(() => {
    'worklet';
    const text = labelText.value;
    const fontIndex = labelFontIndex.value;
    
    let selectedFont: typeof smallFont;
    switch (fontIndex) {
      case 0:
        selectedFont = smallFont;
        break;
      case 1:
        selectedFont = smallFont12;
        break;
      case 2:
        selectedFont = smallFont10;
        break;
      case 3:
        selectedFont = smallFont8;
        break;
      default:
        selectedFont = smallFont;
    }
    
    const textWidth = selectedFont.measureText(text).width;
    if (textWidth <= maxLabelWidth) {
      return text;
    }
    
    // Truncate text to fit within max width with ellipsis
    const ellipsis = '...';
    const ellipsisWidth = selectedFont.measureText(ellipsis).width;
    const availableWidth = maxLabelWidth - ellipsisWidth;
    
    // Binary search for the right truncation point
    let left = 0;
    let right = text.length;
    let result = '';
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const truncated = text.substring(0, mid);
      const width = selectedFont.measureText(truncated).width;
      
      if (width <= availableWidth) {
        result = truncated;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result + ellipsis;
  }, []);

  const labelTextX = useDerivedValue(() => {
    'worklet';
    const text = truncatedLabelText.value;
    const fontIndex = labelFontIndex.value;
    let selectedFont: typeof smallFont;
    switch (fontIndex) {
      case 0:
        selectedFont = smallFont;
        break;
      case 1:
        selectedFont = smallFont12;
        break;
      case 2:
        selectedFont = smallFont10;
        break;
      case 3:
        selectedFont = smallFont8;
        break;
      default:
        selectedFont = smallFont;
    }
    const _fontSize = selectedFont.measureText(text);
    return radius - _fontSize.width / 2;
  }, []);

  const labelTextY = useDerivedValue(() => {
    'worklet';
    const text = truncatedLabelText.value;
    const fontIndex = labelFontIndex.value;
    let selectedFont: typeof smallFont;
    switch (fontIndex) {
      case 0:
        selectedFont = smallFont;
        break;
      case 1:
        selectedFont = smallFont12;
        break;
      case 2:
        selectedFont = smallFont10;
        break;
      case 3:
        selectedFont = smallFont8;
        break;
      default:
        selectedFont = smallFont;
    }
    const _fontSize = selectedFont.measureText(text);
    return radius + _fontSize.height / 2 - fontSize.height / 1.2;
  }, []);

  const labelOpacity0 = useDerivedValue(() => (labelFontIndex.value === 0 ? 1 : 0), []);
  const labelOpacity1 = useDerivedValue(() => (labelFontIndex.value === 1 ? 1 : 0), []);
  const labelOpacity2 = useDerivedValue(() => (labelFontIndex.value === 2 ? 1 : 0), []);
  const labelOpacity3 = useDerivedValue(() => (labelFontIndex.value === 3 ? 1 : 0), []);

  const textX = useDerivedValue(() => {
    const _fontSize = font.measureText(targetText.value);
    return radius - _fontSize.width / 2;
  }, []);

  return (
    <View
      style={styles.chartContainer}
      onStartShouldSetResponder={e => {
        const { locationX, locationY } = e.nativeEvent;
        const x = locationX - radius;
        const y = locationY - radius;
        const distanceFromCenter = Math.sqrt(x * x + y * y);
        const isWithinRing =
          distanceFromCenter >= innerRadius - strokeWidth / 2 && distanceFromCenter <= innerRadius + strokeWidth / 2;
        return isWithinRing;
      }}
      onResponderRelease={handleTouchRelease}
      onResponderTerminationRequest={() => false}>
      <Canvas style={styles.chartContainer}>
        <Path
          path={path}
          color={outerStrokeColor}
          style="stroke"
          strokeJoin="round"
          strokeWidth={outerStrokeWidth}
          strokeCap="round"
          start={0}
          end={1}
        />
        {array.map((_, index) => {
          return (
            <DonutPath
              key={index}
              radius={radius}
              strokeWidth={strokeWidth}
              outerStrokeWidth={outerStrokeWidth}
              color={colors[index]}
              decimals={decimals}
              index={index}
              gap={gap}
              activeIndex={activeIndex}
            />
          );
        })}
        <Group>
          <Text x={labelTextX} y={labelTextY} text={truncatedLabelText} font={smallFont} color={textColor} opacity={labelOpacity0} />
          <Text
            x={labelTextX}
            y={labelTextY}
            text={truncatedLabelText}
            font={smallFont12}
            color={textColor}
            opacity={labelOpacity1}
          />
          <Text
            x={labelTextX}
            y={labelTextY}
            text={truncatedLabelText}
            font={smallFont10}
            color={textColor}
            opacity={labelOpacity2}
          />
          <Text
            x={labelTextX}
            y={labelTextY}
            text={truncatedLabelText}
            font={smallFont8}
            color={textColor}
            opacity={labelOpacity3}
          />
        </Group>
        <Text x={textX} y={radius + fontSize.height + 5 / 2} text={targetText} font={font} color={textColor} />
      </Canvas>
    </View>
  );
};

export default DonutChart;
