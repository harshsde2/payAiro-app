import React from "react";
import {
  Circle,
  Group,
  Path,
  RadialGradient,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { LOGO_ICON_PATHS } from "./logoPaths";

const SPHERE_DARK = "#1A4D2E";
const SPHERE_LIGHT = "#3D8B56";
const SPHERE_HIGHLIGHT = "#5BA86A";
const GLASS_WHITE = "rgba(255,255,255,0.55)";
const ORB_RADIUS = 9;
const ICON_BOUNDS = { width: 60, height: 67, centerX: 30, centerY: 33.5 };

export interface IGlowSphereProps {
  sphereScale: SharedValue<number>;
  sphereOpacity: SharedValue<number>;
  glassOpacity: SharedValue<number>;
  orbAngle: SharedValue<number>;
  centerX: number;
  centerY: number;
  radius: number;
}

const skIconPaths = LOGO_ICON_PATHS.map((d) => Skia.Path.MakeFromSVGString(d)!);

const GlowSphere: React.FC<IGlowSphereProps> = ({
  sphereScale,
  sphereOpacity,
  glassOpacity,
  orbAngle,
  centerX,
  centerY,
  radius,
}) => {
  const opacity = useDerivedValue(() => sphereOpacity.value);
  const glass = useDerivedValue(() => glassOpacity.value);
  const angle = useDerivedValue(() => orbAngle.value);

  const groupTransform = useDerivedValue(() => [
    { translateX: centerX },
    { translateY: centerY },
    { scale: sphereScale.value },
    { translateX: -centerX },
    { translateY: -centerY },
  ]);

  const orbX = useDerivedValue(() => {
    "worklet";
    return centerX + radius * Math.cos(angle.value);
  });
  const orbY = useDerivedValue(() => {
    "worklet";
    return centerY - radius * Math.sin(angle.value);
  });

  const iconScale = (radius * 1.6) / Math.max(ICON_BOUNDS.width, ICON_BOUNDS.height);
  const iconOffsetX = centerX - ICON_BOUNDS.centerX * iconScale;
  const iconOffsetY = centerY - ICON_BOUNDS.centerY * iconScale;
  const iconTransform = [
    { translateX: iconOffsetX },
    { translateY: iconOffsetY },
    { scale: iconScale },
  ];

  return (
    <Group opacity={opacity}>
      <Group transform={groupTransform}>
        <Circle cx={centerX} cy={centerY} r={radius}>
          <RadialGradient
            c={vec(centerX - radius * 0.25, centerY - radius * 0.25)}
            r={radius * 1.2}
            colors={[SPHERE_HIGHLIGHT, SPHERE_LIGHT, SPHERE_DARK]}
            positions={[0, 0.5, 1]}
          />
        </Circle>

        <Group transform={iconTransform}>
          {skIconPaths.map((path, index) => (
            <Path
              key={`sphere-icon-${index}`}
              path={path}
              style="fill"
              color={index === 2 ? "rgba(255,255,255,0.85)" : "white"}
              antiAlias
            />
          ))}
        </Group>

        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          color={GLASS_WHITE}
          opacity={glass}
        />

        <Circle cx={orbX} cy={orbY} r={ORB_RADIUS} color="white" />
      </Group>
    </Group>
  );
};

export default React.memo(GlowSphere);
