import React from "react";
import { Circle, Group, BlurMask } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

const RING_DARK = "rgba(39, 84, 53, 0.5)";
const RING_LIGHT = "rgba(107, 184, 122, 0.55)";
const GLOW_DARK = "rgba(39, 84, 53, 0.18)";
const GLOW_LIGHT = "rgba(107, 184, 122, 0.2)";
const RING_STROKE = 4;
const GLOW_STROKE = 20;

export interface IGreenRingOutlineProps {
  ringRadius: SharedValue<number>;
  ringOpacity: SharedValue<number>;
  ringColorProgress: SharedValue<number>;
  centerX: number;
  centerY: number;
}

const GreenRingOutline: React.FC<IGreenRingOutlineProps> = ({
  ringRadius,
  ringOpacity,
  ringColorProgress,
  centerX,
  centerY,
}) => {
  const r = useDerivedValue(() => ringRadius.value);
  const opacity = useDerivedValue(() => ringOpacity.value);
  const darkOpacity = useDerivedValue(() => 1 - ringColorProgress.value);
  const lightOpacity = useDerivedValue(() => ringColorProgress.value);

  return (
    <Group opacity={opacity}>
      <Group opacity={darkOpacity}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={r}
          style="stroke"
          strokeWidth={GLOW_STROKE}
          color={GLOW_DARK}
        >
          <BlurMask blur={12} style="normal" />
        </Circle>
        <Circle
          cx={centerX}
          cy={centerY}
          r={r}
          style="stroke"
          strokeWidth={RING_STROKE}
          color={RING_DARK}
        />
      </Group>
      <Group opacity={lightOpacity}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={r}
          style="stroke"
          strokeWidth={GLOW_STROKE}
          color={GLOW_LIGHT}
        >
          <BlurMask blur={12} style="normal" />
        </Circle>
        <Circle
          cx={centerX}
          cy={centerY}
          r={r}
          style="stroke"
          strokeWidth={RING_STROKE}
          color={RING_LIGHT}
        />
      </Group>
    </Group>
  );
};

export default React.memo(GreenRingOutline);
