import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import FadeWrapper from './FadeWrapper';

const FadeWrapperExample = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastAction, setLastAction] = useState<string>('');

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  const handleAnimationComplete = () => {
    setLastAction(isVisible ? 'Fade in completed' : 'Fade out completed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Default fade (300ms) */}
        <FadeWrapper visible={isVisible}>
          <View style={styles.card}>
            <Text style={styles.text}>
              Default Fade (300ms)
            </Text>
          </View>
        </FadeWrapper>

        {/* Slow fade (1000ms) with completion callback */}
        <FadeWrapper 
          visible={isVisible}
          duration={1000}
          onComplete={handleAnimationComplete}
        >
          <View style={[styles.card, styles.slowCard]}>
            <Text style={styles.text}>
              Slow Fade (1000ms)
            </Text>
          </View>
        </FadeWrapper>

        {/* Status text */}
        {lastAction ? (
          <Text style={styles.status}>
            {lastAction}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={styles.button}
          onPress={toggleVisibility}
        >
          <Text style={styles.buttonText}>
            {isVisible ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  slowCard: {
    backgroundColor: '#34C759',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FadeWrapperExample; 