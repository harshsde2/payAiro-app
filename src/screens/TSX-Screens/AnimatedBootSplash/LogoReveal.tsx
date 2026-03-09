import React from "react";
import { Path, Skia, Group } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";
import { LOGO_ICON_PATHS, SVG_HEIGHT, SVG_WIDTH, TEXT_PATHS } from "./logoPaths";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOGO_SCALE = (SCREEN_WIDTH * 0.7) / SVG_WIDTH;

const ACCENT_COLOR = "#A9A8A8";

type SkPath = NonNullable<ReturnType<typeof Skia.Path.MakeFromSVGString>>;

interface LogoRevealProps {
  logoDrawProgress: SharedValue<number>;
  textDrawProgress: SharedValue<number>;
  fillReveal: SharedValue<number>;
  centerX: number;
  centerY: number;
}

const HybridPath = React.memo(({
  skPath,
  drawProgress,
  fillReveal,
  color = "white",
  strokeWidth = 2.5,
}: {
  skPath: SkPath;
  drawProgress: SharedValue<number>;
  fillReveal: SharedValue<number>;
  color?: string;
  strokeWidth?: number;
}) => {
  const strokeOpacity = useDerivedValue(() => {
    "worklet";
    if (drawProgress.value <= 0) return 0;
    return 1 - fillReveal.value;
  });

  return (
    <>
      <Path
        path={skPath}
        style="stroke"
        color={color}
        strokeWidth={strokeWidth}
        strokeCap="round"
        strokeJoin="round"
        antiAlias
        start={0}
        end={drawProgress}
        opacity={strokeOpacity}
      />
      <Path
        path={skPath}
        style="fill"
        color={color}
        antiAlias
        opacity={fillReveal}
      />
    </>
  );
});

const LogoReveal: React.FC<LogoRevealProps> = ({
  logoDrawProgress,
  textDrawProgress,
  fillReveal,
  centerX,
  centerY,
}) => {
  const scaledWidth = SVG_WIDTH * LOGO_SCALE;
  const scaledHeight = SVG_HEIGHT * LOGO_SCALE;
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

  const baseTransform = [
    { translateX: offsetX },
    { translateY: offsetY },
    { scale: LOGO_SCALE },
  ];

  return (
    <Group transform={baseTransform}>
      {skIconPaths.map((skPath, index) => (
        <HybridPath
          key={`icon-${index}`}
          skPath={skPath}
          drawProgress={logoDrawProgress}
          fillReveal={fillReveal}
          color={index === 2 ? ACCENT_COLOR : "white"}
          strokeWidth={2.5}
        />
      ))}

      {skTextPaths.map((skPath, index) => (
        <HybridPath
          key={`text-${index}`}
          skPath={skPath}
          drawProgress={textDrawProgress}
          fillReveal={fillReveal}
          strokeWidth={2}
        />
      ))}
    </Group>
  );
};

export default React.memo(LogoReveal);
