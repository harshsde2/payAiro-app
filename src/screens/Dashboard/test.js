import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Animated, Text} from 'react-native';
import Svg, {G, Path, Text as SVGText} from 'react-native-svg';
import Fonts from '../constants/Fonts';
import useSelectorAction from '../hooks/useSelectorAction';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CustomPieChart = () => {
  const {networkLists} = useSelectorAction();
  const [segmentAnimations, setSegmentAnimations] = useState([]);

  const data = [
    {name: 'Bitcoin', percentage: networkLists[0]?.percentage},
    {name: 'Ethereum', percentage: networkLists[1]?.percentage},
    {name: 'Polygon', percentage: networkLists[2]?.percentage},
    {name: 'XRP', percentage: networkLists[3]?.percentage},
  ];
  console.log(data);
  const colors = [
    networkLists[0]?.color,
    networkLists[1]?.color,
    networkLists[2]?.color,
    networkLists[3]?.color,
  ];
  const outerRadius = 100; // Outer radius
  const innerRadius = 0; // Inner radius for the "core"
  const centerX = 150; // X center
  const centerY = 150; // Y center
  const gapAngle = 0.01; // Gap angle in degrees for consistent spacing
  const MIN_SLICE_ANGLE = 1; // Minimum angle for small slices
  const LABEL_OFFSET = 20; // Distance to offset labels outside the chart

  const calculateArc = (startAngle, endAngle) => {
    const x1Outer =
      centerX + outerRadius * Math.cos((Math.PI * startAngle) / 180);
    const y1Outer =
      centerY + outerRadius * Math.sin((Math.PI * startAngle) / 180);

    const x2Outer =
      centerX + outerRadius * Math.cos((Math.PI * endAngle) / 180);
    const y2Outer =
      centerY + outerRadius * Math.sin((Math.PI * endAngle) / 180);

    const x1Inner =
      centerX + innerRadius * Math.cos((Math.PI * startAngle) / 180);
    const y1Inner =
      centerY + innerRadius * Math.sin((Math.PI * startAngle) / 180);

    const x2Inner =
      centerX + innerRadius * Math.cos((Math.PI * endAngle) / 180);
    const y2Inner =
      centerY + innerRadius * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
      L ${x2Inner} ${y2Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
      Z
    `;
  };

  const total = data.reduce((sum, item) => sum + item.percentage, 0);

  const filteredData = data.filter(item => item.percentage > 0);

  if (filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <Svg width={300} height={300}>
          <SVGText
            x="150"
            y="150"
            fontSize="14"
            fill="#fff"
            textAnchor="middle"
            alignmentBaseline="middle">
            No Data
          </SVGText>
        </Svg>
      </View>
    );
  }

  let startAngle = -90; // Start at the top of the circle
  const segments = filteredData.map((item, index) => {
    const sliceAngle = Math.max(
      (item.percentage / total) * 360,
      MIN_SLICE_ANGLE,
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
      color: colors[index % colors.length],
      percentage: item.percentage,
      name: item.name,
      textX,
      textY,
    };
  });

  useEffect(() => {
    const animations = segments.map(() => new Animated.Value(0));
    setSegmentAnimations(animations);

    const animationPromises = segments.map((_, index) => {
      return new Promise(resolve => {
        setTimeout(() => {
          Animated.timing(animations[index], {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start(resolve);
        }, index * 500);
      });
    });

    Promise.all(animationPromises).then(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <View style={{backgroundColor: 'red', padding: 5, borderRadius: 5}} />
          <Text style={{color: 'white', fontFamily: Fonts.bold}}>
            Prescentage
          </Text>
        </View>
      </View>

      <Svg width={300} height={300}>
        <G>
          {segments.map((segment, index) => {
            const animatedPathOpacity = segmentAnimations[index]?.interpolate
              ? segmentAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              : 1;

            return (
              <React.Fragment key={index}>
                <AnimatedPath
                  d={segment.path}
                  fill={segment.color}
                  style={{opacity: animatedPathOpacity}}
                />
                {/* <SVGText
                  x={segment.textX}
                  y={segment.textY}
                  fontSize="12"
                  fontFamily={Fonts.bold}
                  fill="#fff"
                  textAnchor={segment.textX > centerX ? 'middle' : 'middle'}
                  alignmentBaseline="middle">
                  {`${segment.name} ${segment.percentage.toFixed(2)}%`}
                </SVGText> */}
              </React.Fragment>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 30,
  },
});

export default CustomPieChart;
