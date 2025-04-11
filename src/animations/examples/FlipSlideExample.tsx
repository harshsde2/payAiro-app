import React, { useState } from 'react';
import { View, Button, StyleSheet, SafeAreaView, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import FlipSlide from '../animations-components/FlipSlide';

const FlipSlideExample = () => {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(800);
  const [fastPortion, setFastPortion] = useState(0.75);

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>FlipSlide Example</Text>
        <Text style={styles.description}>
          {visible ? 'Showing "Shubham"' : 'Showing "Harsh"'}
        </Text>
        
        <View style={styles.animationContainer}>
          <FlipSlide
            visible={visible}
            topText="Harsh"
            bottomText="Shubham"
            textStyle={styles.flipText}
            flipDuration={duration}
            fastPortion={fastPortion}
            distance={100}
            style={styles.flipSlide}
            onAnimationComplete={() => console.log('Animation completed')}
          />
        </View>
        
        <View style={styles.controlContainer}>
          <Text style={styles.controlLabel}>Animation Duration: {duration}ms</Text>
          <Slider
            style={styles.slider}
            minimumValue={300}
            maximumValue={2000}
            step={100}
            value={duration}
            onValueChange={setDuration}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#000000"
          />
          
          <Text style={styles.controlLabel}>
            Fast Portion: {Math.round(fastPortion * 100)}%
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={0.9}
            step={0.05}
            value={fastPortion}
            onValueChange={setFastPortion}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#000000"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title={visible ? "Show Harsh" : "Show Shubham"}
            onPress={toggleVisibility}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    fontStyle: 'italic',
  },
  animationContainer: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  flipSlide: {
    width: 200,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flipText: {
    textAlign:'left'
  },
  controlContainer: {
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  controlLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: 150,
  },
});

export default FlipSlideExample; 