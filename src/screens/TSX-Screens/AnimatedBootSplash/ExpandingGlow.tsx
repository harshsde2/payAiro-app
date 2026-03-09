import React from "react";
import { Circle, Group, RadialGradient, vec } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_GLOW_RADIUS = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.8;
const GLOW_COLOR = "rgba(44, 106, 63, 0.35)";

export interface IExpandingGlowProps {
  glowRadius: SharedValue<number>;
  glowOpacity: SharedValue<number>;
  centerX: number;
  centerY: number;
}

const ExpandingGlow: React.FC<IExpandingGlowProps> = ({
  glowRadius,
  glowOpacity,
  centerX,
  centerY,
}) => {
  const r = useDerivedValue(() => glowRadius.value * MAX_GLOW_RADIUS);
  const opacity = useDerivedValue(() => glowOpacity.value);

  return (
    <Group opacity={opacity}>
      <Circle cx={centerX} cy={centerY} r={r}>
        <RadialGradient
          c={vec(centerX, centerY)}
          r={MAX_GLOW_RADIUS}
          colors={["transparent", GLOW_COLOR, "transparent"]}
          positions={[0, 0.4, 1]}
        />
      </Circle>
    </Group>
  );
};

export default React.memo(ExpandingGlow);
