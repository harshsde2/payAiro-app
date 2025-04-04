import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@/context/ThemeContext';
import Slide from './Slide';
import GhostSlide from './GhostSlide';
import ExpandingWrapperExample from './ExpandingWrapperExample';
import FadeWrapperExample from './FadeWrapperExample';

const Test = () => {
  const { colors, theme } = useTheme();

  // State for controlling the visibility of each slide example
  const [slideUpVisible, setSlideUpVisible] = useState(true);
  const [slideDownVisible, setSlideDownVisible] = useState(true);
  const [slideLeftVisible, setSlideLeftVisible] = useState(true);
  const [slideRightVisible, setSlideRightVisible] = useState(true);
  const [customSlideVisible, setCustomSlideVisible] = useState(true);
  const [ghostSlideVisible, setGhostSlideVisible] = useState(true);

  // Individual toggle functions for each animation
  const toggleGhostSlide = () => setGhostSlideVisible(prev => !prev);
  const toggleSlideUp = () => setSlideUpVisible(prev => !prev);
  const toggleSlideDown = () => setSlideDownVisible(prev => !prev);
  const toggleSlideLeft = () => setSlideLeftVisible(prev => !prev);
  const toggleSlideRight = () => setSlideRightVisible(prev => !prev);
  const toggleCustomSlide = () => setCustomSlideVisible(prev => !prev);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* <ExpandableCardExample /> */}
      <View style={styles.separator} />
      {/* <ExpandingWrapperExample /> */}
      <ExpandingWrapperExample />
      <View style={styles.separator} />
      <FadeWrapperExample />
      <View style={styles.separator} />
      <Text style={[styles.title, { color: colors.text }]}>Slide Animation Examples</Text>

      {/* Ghost Slide Example */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Ghost Slide Effect</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleGhostSlide}
          >
            <Text style={styles.buttonText}>{ghostSlideVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <GhostSlide
          visible={ghostSlideVisible}
          direction="custom"
          duration={1200}
          distance={1000}
          customX={0}
          customY={1000}
          ghostOpacity={1}
          onAnimationComplete={() => console.log('Ghost slide completed')}
        >
          <View style={[styles.card, {
            backgroundColor: theme === 'dark' ? '#2c7873' : '#43aa8b',
            borderWidth: 2,
            borderColor: theme === 'dark' ? '#75cfb8' : '#277559',
            minHeight: 150,
          }]}>
            <Text style={[styles.cardTitle, { color: '#ffffff' }]}>
              Ghost Slide Effect
            </Text>
            <Text style={[styles.cardText, { color: '#ffffff' }]}>
              The original card stays in place while a duplicate slides away and fades out
            </Text>
            <Text style={[styles.cardSubtext, { color: '#ffffff' }]}>
              Try toggling the button to see the effect
            </Text>
          </View>
        </GhostSlide>
      </View>

      {/* Example 1: Slide Up with Fade */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Slide Up</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleSlideUp}
          >
            <Text style={styles.buttonText}>{slideUpVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Slide
          visible={slideUpVisible}
          direction="up"
          duration={500}
          distance={100}
          onAnimationComplete={() => console.log('Slide up animation completed')}
        >
          <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' }]}>
            <Text style={[styles.cardText, { color: colors.text }]}>
              This card slides up with a fade effect
            </Text>
          </View>
        </Slide>
      </View>

      {/* Example 2: Slide Down with Fade */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Slide Down</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleSlideDown}
          >
            <Text style={styles.buttonText}>{slideDownVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Slide
          visible={slideDownVisible}
          direction="down"
          duration={1000}
          distance={300}
        >
          <View style={[styles.card, { backgroundColor: colors.primary }]}>
            <Text style={styles.cardText}>
              This card slides down with a fade effect
            </Text>
          </View>
        </Slide>
      </View>

      {/* Example 3: Slide Left with Fade */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Slide Left</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleSlideLeft}
          >
            <Text style={styles.buttonText}>{slideLeftVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Slide
          visible={slideLeftVisible}
          direction="left"
          duration={400}
          distance={150}
        >
          <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#444' : '#e1e1e1' }]}>
            <Text style={[styles.cardText, { color: colors.text }]}>
              This card slides in from the left
            </Text>
          </View>
        </Slide>
      </View>

      {/* Example 4: Slide Right with Fade */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Slide Right</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleSlideRight}
          >
            <Text style={styles.buttonText}>{slideRightVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Slide
          visible={slideRightVisible}
          direction="right"
          duration={600}
          distance={120}
        >
          <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#555' : '#d1d1d1' }]}>
            <Text style={[styles.cardText, { color: colors.text }]}>
              This card slides in from the right
            </Text>
          </View>
        </Slide>
      </View>

      {/* Example 5: Custom Diagonal Slide */}
      <View style={styles.exampleContainer}>
        <View style={styles.header}>
          <Text style={[styles.exampleTitle, { color: colors.text }]}>Custom Diagonal Slide</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={toggleCustomSlide}
          >
            <Text style={styles.buttonText}>{customSlideVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Slide
          visible={customSlideVisible}
          direction="custom"
          duration={700}
          customX={50}
          customY={200}
          onAnimationComplete={() => console.log('Custom slide animation completed')}
        >
          <View style={[styles.card, {
            backgroundColor: theme === 'dark' ? '#663399' : '#9966CC',
            minHeight: 120
          }]}>
            <Text style={[styles.cardText, { color: '#ffffff' }]}>
              This card slides diagonally from x=-150, y=-200
            </Text>
            <Text style={[styles.cardSubtext, { color: '#ffffff' }]}>
              Custom coordinates allow for any direction of movement
            </Text>
          </View>
        </Slide>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleContainer: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  }
});

export default Test;