import { useNavigation } from "@react-navigation/native";
import {
  Canvas,
  Group,
  Image,
  Mask,
  Path,
  Rect,
  Skia,
  useImage,
} from "@shopify/react-native-skia";
import { ScreenContainer } from "HOC";
import { SvgIcons } from "constants/svgs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { svgPathProperties } from "svg-path-properties";
import Fonts from "../constants/Fonts";
import HeaderTitle from "./HeaderTitle";

const Offer = ({ width, height }) => {
  const offerImage = useImage(require("../../assets/images/scratch.jpg"));
  return (
    offerImage && (
      <Image image={offerImage} fit="contain" width={width} height={height} />
    )
  );
};
const ScratchPattern = ({ width, height }) => {
  const scratchPatternImage = useImage(
    require("../../assets/images/ScratchCard1.png")
  );

  return (
    scratchPatternImage && (
      <Image
        image={scratchPatternImage}
        fit="cover"
        width={width}
        height={height}
      />
    )
  );
};

export const ScratchCard = () => {
  const [canvasLayoutMeta, setCanvasLayoutMeta] = useState({
    width: 0,
    height: 0,
  });

  const STROKE_WIDTH = useRef(40); // width of the scratch stroke
  const totalAreaScratched = useRef(0); // Total area scratched on the scratch card
  const [isScratched, setIsScratched] = useState(false); // is canvas scratched enough (> threshold)
  const [paths, setPaths] = useState([]); // user's scratch data in form of svg path
  useEffect(() => {
    handleReset();
  }, []);
  const navigation = useNavigation();

  const pan = Gesture.Pan()
    .onStart((g) => {
      const newPaths = [...paths];
      const path = Skia.Path.Make(); // Initiates a new svg path
      path.moveTo(g.x, g.y); // Starting point
      newPaths.push(path);
      setPaths(newPaths);
    })
    .onUpdate((g) => {
      const newPaths = [...paths];
      const path = newPaths[newPaths.length - 1]; // Gets the last added path

      // Ensure path is valid before trying to add to it
      if (path) {
        path.lineTo(g.x, g.y); // Makes a line to the user's current gesture position
        setPaths(newPaths); // Update the paths state with the new path
      }
    })
    .onEnd(() => {
      const pathProperties = new svgPathProperties(
        paths[paths.length - 1].toSVGString()
      );

      const pathArea = pathProperties.getTotalLength() * STROKE_WIDTH.current;
      totalAreaScratched.current += pathArea;
      const { width, height } = canvasLayoutMeta;
      const areaScratched =
        (totalAreaScratched.current / (width * height)) * 100;

      if (areaScratched > 70) {
        setIsScratched(true);
        navigation.navigate("ScratchDetails");
        // Do other stuff like provide a force feedback to the user (Vibration)
        // Disable the gesture handler to avoid registering more inputs (Saves computation and memory)
      }
    })
    .minDistance(1)
    .enabled(!isScratched);

  const handleCanvasLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasLayoutMeta({ width, height });
  }, []);

  const handleReset = () => {
    setIsScratched(false);
    setPaths([]);
    totalAreaScratched.current = 0;
  };

  const { width, height } = useMemo(() => canvasLayoutMeta, [canvasLayoutMeta]);

  return (
    <GestureHandlerRootView>
      <ScreenContainer padding={0}>
        <HeaderTitle rightIcon={<SvgIcons.CrossIcon />} isBack={true} />
        <GestureDetector gesture={pan}>
          <View style={styles.container}>
            <Canvas onLayout={handleCanvasLayout} style={styles.canvas}>
              <Offer width={width} height={height} />
              {!isScratched ? (
                <Mask
                  clip
                  mode="luminance"
                  mask={
                    <Group>
                      <Rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        color="white"
                      />
                      {paths.map((p) => (
                        <Path
                          key={p.toSVGString()}
                          path={p}
                          strokeWidth={STROKE_WIDTH.current}
                          style="stroke"
                          strokeJoin={"round"}
                          strokeCap={"round"}
                          antiAlias
                          color={"black"}
                        />
                      ))}
                    </Group>
                  }
                >
                  <ScratchPattern width={width} height={height} />
                </Mask>
              ) : (
                <Offer width={width} height={height} />
              )}
            </Canvas>
            <Text
              style={{
                color: "#000",
                fontFamily: Fonts.bold,
                fontSize: 30,
                textAlign: "center",
                marginTop: 70,
              }}
            >
              Congratulations!{" "}
            </Text>

            <Text
              style={{
                color: "#000",
                fontFamily: Fonts.regular,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Here is your scratch card{" "}
            </Text>
          </View>
        </GestureDetector>
      </ScreenContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    height: "40%",
    backgroundColor: "transparent",
    alignSelf: "center",
    marginTop: 100,
    borderRadius: 60,
  },
  canvas: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },
  buttonContainer: {
    marginTop: 50,
  },
});

export default ScratchCard;
