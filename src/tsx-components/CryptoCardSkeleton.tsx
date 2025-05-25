import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import Card from './Card';

interface CryptoCardSkeletonProps {
  shimmerColor?: string;
  baseColor?: string;
  speed?: number;
  visible?: boolean;
}

// Using memo to prevent unnecessary re-renders
const CryptoCardSkeleton: React.FC<CryptoCardSkeletonProps> = memo(({
  shimmerColor = 'rgba(255, 255, 255, 0.6)',
  baseColor = 'rgba(255, 255, 255, 0.15)',
  speed = 800,
  visible = true
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  useEffect(() => {
    // Create the shimmer animation with flowing effect
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: speed,
        useNativeDriver: false,
      })
    );
    
    // Store the animation reference to be able to stop it
    animationRef.current = shimmerAnimation;
    
    if (visible) {
      shimmerAnimation.start();
    }
    
    // Clean up animation when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      shimmerAnim.setValue(-1);
    };
  }, [shimmerAnim, speed, visible]);
  
  const styles = createStyles(theme);
  
  // If not visible, don't render anything
  if (!visible) {
    return null;
  }
  
  // Custom shimmer component with a moving highlight effect
  const ShimmerBox = ({ style }: { style: any }) => {
    const width = style.width || 100;
    
    // Create linear gradient-like effect using translateX
    const translateX = shimmerAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: [-width * 2, width * 2]
    });
    
    return (
      <View style={[ { overflow: 'hidden', backgroundColor: baseColor },style]}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: baseColor,
          }}
        />
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            position: 'absolute',
          }}>
          <Animated.View
            style={{
              width: '85%',
              height: '100%',
              backgroundColor: shimmerColor,
              position: 'absolute',
              left: '-45%',
              transform: [{ translateX }, { skewX: '-20deg' }],
            }}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <Card
      style={styles.container}
      padding={0}
      borderRadius={theme.spacing.spacing[10]}
    >
      {/* Header Section */}
      <View style={[styles.header,
        {
          paddingHorizontal: theme.spacing.spacing.md,
          // marginVertical: theme.spacing.spacing.sm,
          paddingVertical: theme.spacing.spacing.md,
          justifyContent: 'space-between',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center'
        }
      ]}>
        <ShimmerBox style={styles.headerTitle} />
        <ShimmerBox style={styles.currencySelector} />
      </View>

      {/* Main Card */}
      <Card
        backgroundColor={theme.colors.palette.white}
        borderRadius={theme.spacing.spacing[10]}
        elevation={7}
        padding={0}
        style={styles.mainCard}
      >
        <ShimmerBox  style={styles.arrowButton} />

        <View style={styles.cardContent}>
          {/* Left Content - Balance Info */}
          {/* <View style={styles.leftContent}>
            <ShimmerBox style={styles.balanceLabel} />
            
            <View style={styles.balanceRow}>
              <ShimmerBox style={styles.balanceAmount} />
              <ShimmerBox style={styles.withdrawButton} />
            </View>
            
            <ShimmerBox style={styles.identifierLabel} />
            
            <View style={styles.identifierRow}>
              <ShimmerBox style={styles.identifier} />
              <ShimmerBox style={styles.copyIcon} />
            </View>
          </View> */}
          
          {/* Right Content - Logo */}
          {/* <View style={styles.logoSection}>
            <ShimmerBox style={styles.logo} />
            <ShimmerBox style={styles.logoText} />
          </View> */}

          <View style={styles.leftContent}>
            <ShimmerBox style={styles.balanceLabel} />
            <View style={styles.balanceRow}>
              <ShimmerBox style={styles.balanceAmount} />
              {/* <ShimmerBox style={styles.withdrawButton} /> */}
            </View>
            <ShimmerBox style={styles.identifierLabel} />
            <View style={styles.identifierRow}>
              <ShimmerBox style={styles.identifier} />
              <ShimmerBox style={styles.copyIcon} />
            </View>
          </View>
          <View style={styles.logoSection}>
            <ShimmerBox style={styles.logo} />
            <View style={styles.logoContainer} >
            <ShimmerBox style={styles.logoText} />
            <View style={styles.logoStripContainer}>

              <ShimmerBox style={styles.logoStrip} />
            </View>
            </View>
          </View>
        </View>
      </Card>
    </Card>
  );
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.palette.green100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.spacing.md,
  },
  headerTitle: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  currencySelector: {
    width: 100,
    height: 35,
    borderRadius: 20,
  },
  mainCard: {
    // width: '100%',
    flex: 1,
    height: 160,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftContent: {
    width: '72%',
    paddingHorizontal: theme.spacing.spacing.lg,
    paddingVertical: theme.spacing.spacing.sm,
    backgroundColor: theme.colors.palette.green700,
    borderTopRightRadius: theme.spacing.spacing[5],
    borderBottomRightRadius: theme.spacing.spacing[5],
  },
  balanceLabel: {
    width: 120,
    height: 15,
    borderRadius: 4,
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  balanceAmount: {
    width: 150,
    height: 40,
    borderRadius: 4,
  },
  withdrawButton: {
    width: 80,
    height: 28,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  identifierLabel: {
    width: 100,
    height: 15,
    borderRadius: 4,
    marginBottom: 8,
  },
  identifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  identifier: {
    width: 150,
    height: 15,
    // borderRadius: 4,
  },
  copyIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  arrowButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    position: 'absolute',
    top: '43%',
    left: '73%',
    backgroundColor:theme.colors.palette.green700,
    zIndex: 1,
  },
  logoSection: {
    // width: '25%',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'blue',
    flex:1,
    height: '100%',
  },
  logo: {
    width: 70,
    height: 30,
    borderRadius: theme.spacing.spacing[2],
    // width: 70,
    // height: 70,
    // borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 15,
  },
  logoText: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderBottomLeftRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    
    // borderRadius: 3,
  },
  logoStripContainer: {
    width: 50,
    height: 40,
    // backgroundColor:'red'
  },
  logoStrip:{
    width: 10,
    height: 40,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 15,
  },
  logoContainer:{
    // backgroundColor:'red',
    marginLeft: 15,
    marginBottom: 15,
  }
});

export default CryptoCardSkeleton; 