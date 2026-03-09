import React from "react";
import { Circle, Group, Path, Skia } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { LOGO_ICON_PATHS } from "./logoPaths";

const SPHERE_COLOR = "#275435";
const ICON_SVG_BOUNDS = { width: 60, height: 67 };

const skIconPaths = LOGO_ICON_PATHS.map(
  (d) => Skia.Path.MakeFromSVGString(d)!,
);

export interface ISphereDissolveProps {
  sphereFade: SharedValue<number>;
  centerX: number;
  centerY: number;
  radius: number;
}

const SphereDissolve: React.FC<ISphereDissolveProps> = ({
  sphereFade,
  centerX,
  centerY,
  radius,
}) => {
  const greenOpacity = useDerivedValue(() => 1 - sphereFade.value);
  const whiteLogoOpacity = useDerivedValue(() => 1 - sphereFade.value);

  const iconScale =
    (radius * 0.95) / Math.max(ICON_SVG_BOUNDS.width, ICON_SVG_BOUNDS.height);
  const iconOffsetX = centerX - (ICON_SVG_BOUNDS.width / 2) * iconScale;
  const iconOffsetY = centerY - (ICON_SVG_BOUNDS.height / 2) * iconScale;

  return (
    <Group>
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        color={SPHERE_COLOR}
        opacity={greenOpacity}
      />

      <Group
        transform={[
          { translateX: iconOffsetX },
          { translateY: iconOffsetY },
          { scale: iconScale },
        ]}
        opacity={whiteLogoOpacity}
      >
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
    </Group>
  );
};

export default React.memo(SphereDissolve);
