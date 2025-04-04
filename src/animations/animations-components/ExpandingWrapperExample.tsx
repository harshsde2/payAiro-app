import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, LayoutRectangle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpandableComp from './ExpandableComp';
import { Ionicons } from '@expo/vector-icons';

const ExpandingWrapperExample = () => {
    const [parentLayout,setParentLayout] = useState<LayoutRectangle | null>(null);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Expandable Component Examples</Text>
        
        {/* Basic Example */}
        <View style={styles.exampleContainer} >
          <Text style={styles.exampleTitle}>Basic Wrapper Example</Text>
          <View style={styles.demoContainer} onLayout={(e) => setParentLayout(e.nativeEvent.layout)}>
            <ExpandableComp
              initialWidth={60}
              initialHeight={80}
              backgroundColor="#FF5252"
              borderRadius={10}
              parentLayout={parentLayout}
              position={{
                top: 50,
                right: 20,
              }}
              onAnimationComplete={() => console.log('Animation completed!')}
            >
              <View style={styles.contentContainer}>
                <Text style={styles.contentText}>Hello World!</Text>
              </View>
            </ExpandableComp>
          </View>
        </View>

        {/* Custom Size Example */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Custom Size Example</Text>
          <View style={[styles.demoContainer, { backgroundColor: '#4CAF50' }]}>
            <ExpandableComp
              initialWidth={40}
              initialHeight={40}
              containerHeight={140}
              backgroundColor="#1E88E5"
              borderRadius={20}
              duration={800}
            >
              <View style={styles.contentContainer}>
                <Ionicons name="information-circle" size={24} color="white" />
                <Text style={styles.contentText}>This is a custom sized expandable component</Text>
              </View>
            </ExpandableComp>
          </View>
        </View>

        {/* Card-like Example */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Card-like Example</Text>
          <View style={[styles.demoContainer, { backgroundColor: '#673AB7' }]}>
            <ExpandableComp
              initialWidth={60}
              initialHeight={100}
              containerHeight={160}
              backgroundColor="#FFC107"
              borderRadius={8}
              duration={1200}
            >
              <View style={[styles.contentContainer, { padding: 15 }]}>
                <Text style={[styles.contentText, { color: '#333' }]}>Card Title</Text>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardText, { color: '#333' }]}>
                    This component can be used to create expandable cards, menus,
                    and other interactive UI elements.
                  </Text>
                </View>
              </View>
            </ExpandableComp>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  exampleContainer: {
    marginBottom: 32,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  demoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardContent: {
    marginTop: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ExpandingWrapperExample; 