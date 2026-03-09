import React from "react";
import { Path, Skia, Group } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";
import {
  LOGO_ICON_PATHS,
  SVG_HEIGHT,
  SVG_WIDTH,
  TEXT_PATHS,
} from "./logoPaths";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOGO_SCALE = (SCREEN_WIDTH * 0.7) / SVG_WIDTH;

const DARK_GREEN = "#2C6A3F";
const LIGHT_GREEN_ACCENT = "#468349";

export interface IFlatLogoRevealProps {
  flatLogoOpacity: SharedValue<number>;
  flatLogoScale: SharedValue<number>;
  textRevealProgress: SharedValue<number>;
  centerX: number;
  centerY: number;
}

const scaledWidth = SVG_WIDTH * LOGO_SCALE;
const scaledHeight = SVG_HEIGHT * LOGO_SCALE;

const FlatLogoReveal: React.FC<IFlatLogoRevealProps> = ({
  flatLogoOpacity,
  flatLogoScale,
  textRevealProgress,
  centerX,
  centerY,
}) => {
  const offsetX = centerX - scaledWidth / 2;
  const offsetY = centerY - scaledHeight / 2;

  const skIconPaths = React.useMemo(
    () => LOGO_ICON_PATHS.map((d) => Skia.Path.MakeFromSVGString(d)!),
    [],
  );
  const skTextPaths = React.useMemo(
    () => TEXT_PATHS.map((d) => Skia.Path.MakeFromSVGString(d)!),
    [],
  );

  const scaleTransform = useDerivedValue(() => [
    { translateX: centerX },
    { translateY: centerY },
    { scale: flatLogoScale.value },
    { translateX: -centerX },
    { translateY: -centerY },
  ]);

  const baseTransform = [
    { translateX: offsetX },
    { translateY: offsetY },
    { scale: LOGO_SCALE },
  ];

  return (
    <Group opacity={flatLogoOpacity} transform={scaleTransform}>
      <Group transform={baseTransform}>
        {skIconPaths.map((skPath, index) => (
          <Path
            key={`flat-icon-${index}`}
            path={skPath}
            style="fill"
            color={index === 2 ? LIGHT_GREEN_ACCENT : DARK_GREEN}
            antiAlias
          />
        ))}
        {skTextPaths.map((skPath, index) => (
          <Path
            key={`flat-text-${index}`}
            path={skPath}
            style="fill"
            color={DARK_GREEN}
            antiAlias
            start={0}
            end={textRevealProgress}
          />
        ))}
      </Group>
    </Group>
  );
};

export default React.memo(FlatLogoReveal);
