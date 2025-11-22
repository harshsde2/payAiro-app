import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Line, vec } from '@shopify/react-native-skia';

const GridBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const gridSize = 40;
  const numColumns = Math.ceil(width / gridSize);
  const numRows = Math.ceil(height / gridSize);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {Array.from({ length: numColumns }).map((_, i) => (
        <Line
          key={`v-${i}`}
          p1={vec(i * gridSize, 0)}
          p2={vec(i * gridSize, height)}
          color="rgba(255, 255, 255, 0.3)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: numRows }).map((_, i) => (
        <Line
          key={`h-${i}`}
          p1={vec(0, i * gridSize)}
          p2={vec(width, i * gridSize)}
          color="rgba(255, 255, 255, 0.3)"
          strokeWidth={1}
        />
      ))}
    </Canvas>
  );
};

export default GridBackground;

