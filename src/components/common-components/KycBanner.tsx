import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "styles/ThemeContext";
import { toKycMode } from "types/kyc";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { SvgIcons } from "constants/svgs";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const COLLAPSED_HEIGHT = 60;
const EXTRA_PADDING = 20; // Extra padding to ensure content is never clipped

const KycBanner: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [currentRouteName, setCurrentRouteName] = useState<string | null>(null);

  // Helper function to get the focused route recursively (handles nested navigators)
  const getFocusedRoute = useCallback((navState: any): any => {
    if (!navState) return null;
    
    const route = navState.routes[navState.index];
    if (!route) return null;
    
    // If this route has nested state, get the focused route from it
    if (route.state) {
      const nestedRoute = getFocusedRoute(route.state);
      if (nestedRoute) return nestedRoute;
    }
    
    return route;
  }, []);

  // Track current route using navigation state
  useEffect(() => {
    const updateRoute = () => {
      try {
        const state = navigation.getState();
        if (state) {
          const focusedRoute = getFocusedRoute(state);
          setCurrentRouteName(focusedRoute?.name || null);
        }
      } catch (error) {
        // Navigation state not available yet
        setCurrentRouteName(null);
      }
    };

    // Get initial route
    updateRoute();

    // Set up interval to check route changes (since we're outside a screen)
    const interval = setInterval(updateRoute, 200);

    return () => {
      clearInterval(interval);
    };
  }, [navigation, getFocusedRoute]);

  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  // Animation values
  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);
  const chevronRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const borderRadius = useSharedValue(0);

  // Calculate total expanded height dynamically
  const expandedHeight = COLLAPSED_HEIGHT + contentHeight + EXTRA_PADDING;

  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    const targetHeight = newExpanded ? expandedHeight : COLLAPSED_HEIGHT;
    animatedHeight.value = withTiming(targetHeight, {
      duration: 400,
    });
    
    contentOpacity.value = withTiming(newExpanded ? 1 : 0, {
      duration: 300,
    });
    
    chevronRotation.value = withTiming(newExpanded ? 180 : 0, {
      duration: 400,
    });
    
    borderRadius.value = withTiming(newExpanded ? 16 : 0, {
      duration: 400,
    });
  }, [isExpanded, expandedHeight, animatedHeight, chevronRotation, contentOpacity, borderRadius]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && Math.abs(height - contentHeight) > 1) {
      setContentHeight(height);
      // If banner is already expanded, update the height animation
      if (isExpanded) {
        const newExpandedHeight = COLLAPSED_HEIGHT + height + EXTRA_PADDING;
        animatedHeight.value = withTiming(newExpandedHeight, { duration: 200 });
      }
    }
  }, [contentHeight, isExpanded, animatedHeight]);

  const handleNavigateToKYC = () => {
    navigation.navigate(NAVIGATION_SCREENS.PERSONAL as never);
  };

  // Calculate values needed for hooks (must be before early return)
  const isNotStarted = mode === "not_started";

  // Colors and Gradients
  const gradientColors = isNotStarted
    ? [theme.colors.palette.yellow500, "#FFAA00"] // Yellow to Orange-ish
    : ["#E0F7FA", "#80DEEA"]; // Cyan/Blue gradient for "Under Review"

  const textColor = isNotStarted ? "#332200" : "#006064"; // Dark Cyan/Blue for text
  const iconColor = isNotStarted ? "#332200" : "#006064";
  const buttonBg = theme.colors.palette.white;
  const buttonText = isNotStarted ? "#FFAA00" : theme.colors.palette.green700;

  // Animated styles - using direct height value instead of interpolation
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
      borderBottomLeftRadius: borderRadius.value,
      borderBottomRightRadius: borderRadius.value,
    };
  });

  // Content visibility based on expansion state
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${chevronRotation.value}deg` }],
    };
  });

  // Messages based on mode
  const shortMessage = useMemo(() => {
    if (isNotStarted) {
      return "Action Required: Complete KYC";
    }
    return "KYC Under Review";
  }, [isNotStarted]);

  const fullMessage = useMemo(() => {
    if (isNotStarted) {
      return "Unlock full access by completing your verification. It only takes a few minutes.";
    }
    return "Your documents are under review. You currently have view-only access. We'll notify you once approved.";
  }, [isNotStarted]);

  const styles = getStyles(theme, textColor, isNotStarted, COLLAPSED_HEIGHT);

  // Early return AFTER all hooks have been called
  // Hide banner on Personal or CybridWebView screens
  if (
    currentRouteName &&
    (currentRouteName === NAVIGATION_SCREENS.PERSONAL ||
      currentRouteName === NAVIGATION_SCREENS.CYBRID_WEB_VIEW)
  ) {
    return null;
  }

  // Early return if KYC is not pending or not started
  if (mode !== "pending" && mode !== "not_started") return null;

  return (
    <View style={styles.wrapper}>
      <SafeAreaView 
        edges={["top"]} 
        style={styles.safeAreaContainer}
      >
        <AnimatedGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.container, containerAnimatedStyle]}
        >
          <View style={styles.contentWrapper}>
            {/* Short message row - always visible */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={handleToggle}
              style={styles.shortMessageRow}
            >
              <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: isNotStarted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)' }]}>
                  {isNotStarted ? (
                    <SvgIcons.InfoNote width={30} height={30} fill={iconColor} />
                  ) : (
                    <SvgIcons.SecurityIcon width={24} height={24} fill={iconColor} />
                  )}
                </View>
                <Text style={[styles.shortMessageText, { color: textColor }]}>
                  {shortMessage}
                </Text>
              </View>

              <Animated.View style={chevronAnimatedStyle}>
                <SvgIcons.ChevronDown
                  width={14}
                  height={14}
                  fill={iconColor}
                />
              </Animated.View>
            </TouchableOpacity>

            {/* Expanded content */}
            <Animated.View style={[styles.expandedContent, contentAnimatedStyle]}>
              <View onLayout={handleContentLayout}>
                <Text 
                  style={[styles.fullMessageText, { color: textColor }]}
                >
                  {fullMessage}
                </Text>
                {isNotStarted && (
                  <TouchableOpacity
                    onPress={handleNavigateToKYC}
                    style={[styles.actionButton, { backgroundColor: buttonBg }]}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.actionButtonText, { color: buttonText }]}>
                      Complete KYC Now
                    </Text>
                    <SvgIcons.ChevronRight width={12} height={12} fill={buttonText} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </AnimatedGradient>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (theme: any, textColor: string, isNotStarted: boolean, collapsedHeight: number) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      zIndex: 1000,
      backgroundColor: 'transparent',
    },
    safeAreaContainer: {
      width: "100%",
      backgroundColor: 'transparent',
    },
    container: {
      width: "100%",
      shadowColor: theme.colors.palette.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      overflow: "hidden",
    },
    contentWrapper: {
      paddingHorizontal: theme.spacing.spacing[4],
      flex: 1,
    },
    shortMessageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: collapsedHeight, // Fixed height for the collapsed header part
      minHeight: collapsedHeight,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    shortMessageText: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.3,
      flexShrink: 1,
    },
    expandedContent: {
      paddingHorizontal: 4,
    },
    fullMessageText: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 20,
      marginBottom: isNotStarted ? 16 : 12,
      opacity: 0.9,
    },
    actionButton: {
      flexDirection: 'row',
      alignSelf: "flex-start",
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: "700",
    },
  });

export default KycBanner;
