import React from "react";
import { Path, Skia, Group } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";
import { LOGO_ICON_PATHS } from "./logoPaths";

const DARK_GREEN = "#2C6A3F";
const LIGHT_GREEN_ACCENT = "#468349";
const ICON_SVG_BOUNDS = { width: 60, height: 67 };

const skIconPaths = LOGO_ICON_PATHS.map(
  (d) => Skia.Path.MakeFromSVGString(d)!,
);

export interface IFlatIconOnlyProps {
  flatIconOpacity: SharedValue<number>;
  centerX: number;
  centerY: number;
  iconSize: number;
}

const FlatIconOnly: React.FC<IFlatIconOnlyProps> = ({
  flatIconOpacity,
  centerX,
  centerY,
  iconSize,
}) => {
  const iconScale =
    iconSize / Math.max(ICON_SVG_BOUNDS.width, ICON_SVG_BOUNDS.height);
  const iconOffsetX = centerX - (ICON_SVG_BOUNDS.width / 2) * iconScale;
  const iconOffsetY = centerY - (ICON_SVG_BOUNDS.height / 2) * iconScale;

  return (
    <Group
      opacity={flatIconOpacity}
      transform={[
        { translateX: iconOffsetX },
        { translateY: iconOffsetY },
        { scale: iconScale },
      ]}
    >
      {skIconPaths.map((path, index) => (
        <Path
          key={`flat-icon-${index}`}
          path={path}
          style="fill"
          color={index === 2 ? LIGHT_GREEN_ACCENT : DARK_GREEN}
          antiAlias
        />
      ))}
    </Group>
  );
};

export default React.memo(FlatIconOnly);
