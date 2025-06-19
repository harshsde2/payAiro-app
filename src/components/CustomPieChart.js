import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import Svg, { G, Path, Text as SVGText } from "react-native-svg";
import Fonts from "../constants/Fonts";
import { themes } from "styles";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Helper functions moved outside component to avoid recreation
const toRadians = (angle) => (Math.PI * angle) / 180;

const CustomPieChart = React.memo(
  ({ allocationLists = [], isTx = false, amount = 0 }) => {
    const [segmentAnimations, setSegmentAnimations] = useState([]);

    // Constants defined outside functions for better performance
    const outerRadius = isTx ? 70 : 100;
    const innerRadius = 0;
    const centerX = isTx ? 120 : 150;
    const centerY = isTx ? 70 : 150;
    const gapAngle = 0.01;
    const MIN_SLICE_ANGLE = 1;
    const LABEL_OFFSET = 20;

    // Memoize this function to avoid recreation on each render
    const calculateArc = useCallback(
      (startAngle, endAngle) => {
        const x1Outer = centerX + outerRadius * Math.cos(toRadians(startAngle));
        const y1Outer = centerY + outerRadius * Math.sin(toRadians(startAngle));
        const x2Outer = centerX + outerRadius * Math.cos(toRadians(endAngle));
        const y2Outer = centerY + outerRadius * Math.sin(toRadians(endAngle));

        const x1Inner = centerX + innerRadius * Math.cos(toRadians(startAngle));
        const y1Inner = centerY + innerRadius * Math.sin(toRadians(startAngle));
        const x2Inner = centerX + innerRadius * Math.cos(toRadians(endAngle));
        const y2Inner = centerY + innerRadius * Math.sin(toRadians(endAngle));

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
      L ${x2Inner} ${y2Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
      Z
    `;
      },
      [outerRadius, innerRadius, centerX, centerY]
    );

    //
    const filteredData = useMemo(
      () => allocationLists.filter((item) => item?.percentage > 0),
      [allocationLists]
    );

    //
    const total = useMemo(
      () =>
        filteredData.reduce((sum, item) => sum + (item?.percentage || 0), 0),
      [filteredData]
    );

    const segments = useMemo(() => {
      if (filteredData.length === 0 || total === 0) return [];

      let startAngle = -90;
      return filteredData.map((item) => {
        const sliceAngle = Math.max(
          ((item.percentage || 0) / total) * 360,
          MIN_SLICE_ANGLE
        );
        const endAngle = startAngle + sliceAngle - gapAngle;
        const path = calculateArc(startAngle, endAngle);
        startAngle = endAngle + gapAngle;

        const midAngle = (startAngle + endAngle) / 2;
        const textX =
          centerX +
          (outerRadius + LABEL_OFFSET) * Math.cos((Math.PI * midAngle) / 180);
        const textY =
          centerY +
          (outerRadius + LABEL_OFFSET) * Math.sin((Math.PI * midAngle) / 180);

        return {
          path,
          color: item.color,
          percentage: item.percentage,
          name: item.name,
          textX,
          textY,
        };
      });
    }, [filteredData, total, calculateArc, centerX, centerY, outerRadius]);

    // Memoize style arrays to prevent unnecessary re-renders
    const containerStyle = useMemo(
      () => [
        styles.container,
        { padding: isTx ? 20 : 0 },
        { backgroundColor: isTx ? "rgba(245, 245, 245, 0.6)" : "#000" },
      ],
      [isTx]
    );

    // Create animation logic
    useEffect(() => {
      // Only create new animations if segments change
      if (segments.length === 0) return;

      // Clean up previous animations first
      segmentAnimations.forEach((anim) => anim.stopAnimation());

      const animations = segments.map(() => new Animated.Value(0));
      setSegmentAnimations(animations);

      // Create animation sequence
      const animationSequence = segments.map((_, index) => {
        return Animated.timing(animations[index], {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        });
      });

      // Run animations with staggered delays
      segments.forEach((_, index) => {
        setTimeout(() => {
          animationSequence[index].start();
        }, index * 200); // Reduced delay for faster rendering
      });

      // Clean up on unmount
      return () => {
        animations.forEach((anim) => anim.stopAnimation());
      };
    }, [segments]);

    // ❗Keep hooks above this conditional return
    if (filteredData.length === 0) {
      return (
        <View style={styles.container}>
          <Svg width={100} height={100}>
            <SVGText
              x="50"
              y="50"
              fontSize="14"
              fill="#fff"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              No Data
            </SVGText>
          </Svg>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <View style={styles.chartWrapper}>
          <Svg width={isTx ? 250 : 250} height={isTx ? 150 : 210}>
            <G>
              {segments.map((segment, index) => {
                const animatedOpacity =
                  segmentAnimations[index]?.interpolate?.({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }) ?? 1;

                return (
                  <AnimatedPath
                    key={`segment-${index}`}
                    d={segment.path}
                    fill={segment.color}
                    stroke="#000"
                    x={isTx ? 0 : -45}
                    y={isTx ? 0 : -45}
                    strokeWidth={isTx ? 0 : 2}
                    style={{ opacity: animatedOpacity }}
                  />
                );
              })}
            </G>
          </Svg>

          <View style={styles.legendContainer}>
            {isTx && (
              <Text
                style={{
                  color: "black",
                  fontSize: 22,
                  position: "absolute",
                  top: -40,
                  right: 80,
                  fontFamily: Fonts.bold,
                }}
              >
                $ {amount}
              </Text>
            )}
            {allocationLists.map((item, index) => {
              // Memoize color style to avoid recreating objects
              const colorStyle = { backgroundColor: item.color };
              const textStyle = {
                ...styles.legendText,
                color: isTx ? "#000" : "#fff",
                fontSize: 10,
              };

              return (
                <View key={`legend-${index}`} style={styles.legendRow}>
                  <View style={[styles.colorBox, colorStyle]} />
                  <Text style={textStyle}>
                    {item?.assetType?.toUpperCase()} (
                    {(item?.percentage || 0).toFixed(1)}
                    %)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: themes.dark.colors.palette.green700,
    borderRadius: 30,
  },
  chartWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  legendContainer: {
    // width: '40%',
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  colorBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    color: "#fff",
    fontFamily: Fonts.bold,
    fontSize: 6,
  },
});

export default CustomPieChart;
