import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SvgProps } from "react-native-svg";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { markAppIntroSeen } from "auth/authSession";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { introSliderStyles } from "@new-ui/styles/screens/auth/introSliderStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import GlassyWrapper from "@new-ui/components/common-components/GlassyWrapper";
import { Button } from "@new-ui/components/common-components/layout";
import { AppIcon } from "@new-ui/assets/svgs";
import { IntroSliderScreenNavigationProp } from "./types";
import PayAiroMark from "./assets/PayAiroMark.svg";
import IdCardCheck from "./assets/IdCardCheck.svg";
import ShieldCheck from "./assets/ShieldCheck.svg";

type IntroSlide = {
  key: string;
  gradientColors: string[];
  gradientStart: { x: number; y: number };
  gradientEnd: { x: number; y: number };
  title: string;
  /** Optional secondary headline shown between the title and the subtitle. */
  tagline?: string;
  subtitle: string;
  cta: string;
  Icon: React.FC<SvgProps>;
  /** Defaults to a square 84x84 icon; override to preserve non-square art aspect ratio. */
  iconSize?: { width: number; height: number };
};

const SUBTITLE_COLOR = "#3F4B45";
const BACKGROUND_FADE_MS = 280;

const INTRO_SLIDES: IntroSlide[] = [
  {
    key: "intro",
    gradientColors: ["#B8F5B6", "#EAF6EC", "#FFFFFF"],
    gradientStart: { x: 0, y: 0 },
    gradientEnd: { x: 1, y: 1 },
    title: "Welcome to PayAiro!",
    tagline: "The only App You'll Love for Managing Crypto & Fiat.",
    subtitle:
      "Manage fiat and crypto in one place: send, receive, buy, sell, or hold. Pay instantly with a QR code, wallet address, or your personal PayAiro Tag.",
    cta: "Next",
    Icon: PayAiroMark,
    iconSize: { width: 52, height: 56 },
  },
  {
    key: "account-creation",
    gradientColors: ["#FFFFFF", "#D9FAD8", "#81EB7F"],
    gradientStart: { x: 1, y: 0 },
    gradientEnd: { x: 0, y: 1 },
    title: "Sign Up in Minutes",
    subtitle:
      "Create your PayAiro account, provide your basic details, and complete a quick identity check. Once verified, your account is activated and ready to use.",
    cta: "Next",
    Icon: IdCardCheck,
  },
  {
    key: "debit-card",
    gradientColors: ["#81EB7F", "#FFFFFF", "#B8F5B6"],
    gradientStart: { x: 0, y: 1 },
    gradientEnd: { x: 1, y: 0 },
    title: "Add Your Card, Start Transactions",
    subtitle:
      "Link your debit card to buy or sell crypto anytime, from anywhere. Every transaction processes instantly, so your funds are ready when you need them.",
    cta: "Next",
    Icon: AppIcon.DebitCard,
  },
  {
    key: "security",
    gradientColors: ["#D9FAD8", "#B8F5B6", "#FFFFFF"],
    gradientStart: { x: 1, y: 1 },
    gradientEnd: { x: 0, y: 0 },
    title: "Your Safety, Our Priority",
    subtitle:
      "Your account is protected with multilayer security, including two-factor authentication, biometric login, and bank-level encryption.",
    cta: "Get Started",
    Icon: ShieldCheck,
  },
];

const LAST_INDEX = INTRO_SLIDES.length - 1;

const IntroSliderScreen: React.FC = () => {
  const navigation = useNavigation<IntroSliderScreenNavigationProp>();
  const { theme } = useTheme();
  const styles = introSliderStyles(theme);
  const { width } = useWindowDimensions();

  const contentScrollRef = useRef<ScrollView>(null);
  const isNavigatingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndexState] = useState(0);

  // Background crossfades between slides instead of sliding with the content.
  // `displayIndex` is the committed (bottom) layer; the top layer fades in the
  // incoming slide's gradient, then `displayIndex` catches up once settled.
  const [displayIndex, setDisplayIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const setActiveIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndexState(index);
  }, []);

  useEffect(() => {
    if (activeIndex === displayIndex) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: BACKGROUND_FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setDisplayIndex(activeIndex);
    });
  }, [activeIndex, displayIndex, fadeAnim]);

  // Re-sync scroll offset on rotation / window-size changes so we never land
  // between two slides after a resize (iPad split-view, foldables, rotation).
  useEffect(() => {
    contentScrollRef.current?.scrollTo({ x: activeIndexRef.current * width, animated: false });
  }, [width]);

  const completeIntro = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    markAppIntroSeen();
    navigation.replace(NAVIGATION_SCREENS.NEW_ONBOARDING);
  }, [navigation]);

  const goToIndex = useCallback(
    (index: number) => {
      if (isNavigatingRef.current) return;
      const clamped = Math.max(0, Math.min(index, LAST_INDEX));
      isNavigatingRef.current = true;
      setActiveIndex(clamped);
      contentScrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [width, setActiveIndex]
  );

  const handleNext = useCallback(() => {
    if (activeIndexRef.current >= LAST_INDEX) {
      completeIntro();
      return;
    }
    goToIndex(activeIndexRef.current + 1);
  }, [completeIntro, goToIndex]);

  const handleScrollSettle = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
      isNavigatingRef.current = false;
    },
    [width, setActiveIndex]
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (activeIndexRef.current > 0) {
          goToIndex(activeIndexRef.current - 1);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [goToIndex])
  );

  const activeSlide = INTRO_SLIDES[activeIndex];
  const displaySlide = INTRO_SLIDES[displayIndex];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={displaySlide.gradientColors[0]} />

      {/* Fixed, crossfading background — does not slide with the content. */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={displaySlide.gradientColors}
          start={displaySlide.gradientStart}
          end={displaySlide.gradientEnd}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={activeSlide.gradientColors}
            start={activeSlide.gradientStart}
            end={activeSlide.gradientEnd}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <SafeAreaView style={styles.safeContent} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.topRow}>
          {activeIndex !== LAST_INDEX && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={completeIntro}
              accessibilityRole="button"
              accessibilityLabel="Skip introduction"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CustomText
                variant="label"
                fontWeight="semiBold"
                color={theme.colors.black}
                style={{ opacity: 0.6 }}
              >
                Skip
              </CustomText>
            </TouchableOpacity>
          )}
        </View>

        {/* Only this content (icon + copy) slides between slides. */}
        <ScrollView
          ref={contentScrollRef}
          style={styles.contentScrollView}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollSettle}
          onScrollEndDrag={handleScrollSettle}
        >
          {INTRO_SLIDES.map((slide) => (
            <View key={slide.key} style={[styles.centerContent, { width }]}>
              <CustomText
                variant="h3"
                fontWeight="extraBold"
                color={theme.colors.black}
                style={styles.headline}
              >
                {slide.title}
              </CustomText>

              <GlassyWrapper
                style={styles.iconBadge}
                borderRadius={85}
                blurAmount={14}
                blurType="light"
                overlayOpacity={0.12}
              >
                <slide.Icon
                  width={slide.iconSize?.width ?? 84}
                  height={slide.iconSize?.height ?? 84}
                />
              </GlassyWrapper>

              {slide.tagline && (
                <CustomText
                  variant="h6"
                  fontWeight="semiBold"
                  color={theme.colors.primary}
                  style={styles.tagline}
                >
                  {slide.tagline}
                </CustomText>
              )}
              <CustomText
                variant="bodySmall"
                fontWeight="medium"
                color={SUBTITLE_COLOR}
                style={styles.subtitle}
              >
                {slide.subtitle}
              </CustomText>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomRow}>
          <View style={styles.dotsRow}>
            {INTRO_SLIDES.map((dotSlide, dotIndex) => (
              <View
                key={dotSlide.key}
                style={[
                  styles.dot,
                  dotIndex === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
          <Button
            onPress={handleNext}
            color={theme.colors.primary}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel={activeSlide.cta}
          >
            {activeSlide.cta}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default IntroSliderScreen;
