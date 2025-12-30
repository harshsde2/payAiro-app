import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, withTiming } from 'react-native-reanimated';
import { DonutPathProps } from '../types';

const DonutPath = ({
  radius,
  gap,
  strokeWidth,
  outerStrokeWidth,
  color,
  decimals,
  index,
  activeIndex,
}: DonutPathProps) => {
  const innerRadius = radius - outerStrokeWidth / 2;

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  const start = useDerivedValue(() => {
    if (index === 0) {
      return gap;
    }
    const decimal = decimals.value.slice(0, index);

    const sum = decimal.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return withTiming(sum + gap, {
      duration: 1000,
    });
  }, []);

  const end = useDerivedValue(() => {
    if (index === decimals.value.length - 1) {
      return withTiming(1, { duration: 1000 });
    }

    const decimal = decimals.value.slice(0, index + 1);

    const sum = decimal.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return withTiming(sum, {
      duration: 1000,
    });
  }, []);

  // Create shadow path (slightly offset)
  const shadowPath = Skia.Path.Make();
  shadowPath.addCircle(radius + 2, radius + 3, innerRadius);

  const shadowColor = useDerivedValue(() =>
    activeIndex.value === null || activeIndex.value === index ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)',
  );

  const shadowOpacity = useDerivedValue(() => (activeIndex.value === null || activeIndex.value === index ? 0.4 : 0.2));

  return (
    <>
      {/* Shadow Path - only show for the active segment */}
      {activeIndex.value === null ||
        (activeIndex.value === index && (
          <Path
            path={shadowPath}
            color={shadowColor}
            opacity={shadowOpacity}
            style="stroke"
            strokeJoin="round"
            strokeWidth={strokeWidth}
            strokeCap="round"
            start={start}
            end={end}
          />
        ))}
      <Path
        path={path}
        color={color}
        opacity={useDerivedValue(() => (activeIndex.value === null || activeIndex.value === index ? 1 : 0.3))}
        style="stroke"
        strokeJoin="round"
        strokeWidth={strokeWidth}
        strokeCap="round"
        start={start}
        end={end}
      />
    </>
  );
};

export default DonutPath;
