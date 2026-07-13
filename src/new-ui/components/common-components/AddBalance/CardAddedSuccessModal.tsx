import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { TRANSACTION_SUCCESS } from 'lottie/lottie';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
// TEMP-DEBUG: production add-card diagnostics (see addCardDebugReport.ts for removal).
import { copyAddCardDebugReport } from '@new-ui/components/common-components/AddBalance/addCardDebugReport';

const ENTRANCE_MS = 280;
const FALLBACK_COMPLETE_MS = 2800;

export type CardAddedSuccessModalProps = {
  visible: boolean;
  onComplete: () => void;
  title?: string;
  message?: string;
  /** TEMP-DEBUG: shows a copy-debug-info button and waits for a tap instead of auto-dismissing. */
  showDebugCopy?: boolean;
};

const CardAddedSuccessModal: React.FC<CardAddedSuccessModalProps> = ({
  visible,
  onComplete,
  title = 'Card Added Successfully',
  message = 'Your debit card is ready to use.',
  showDebugCopy = false,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const completedRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      completedRef.current = false;
      opacity.setValue(0);
      scale.setValue(0.96);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      return;
    }

    completedRef.current = false;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // TEMP-DEBUG: with the copy button visible, wait for the user instead of auto-dismissing.
    if (!showDebugCopy) {
      fallbackTimerRef.current = setTimeout(finishOnce, FALLBACK_COMPLETE_MS);
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [visible, finishOnce, opacity, scale, showDebugCopy]);

  const handleAnimationFinish = useCallback(
    (isCancelled?: boolean) => {
      if (isCancelled) return;
      if (showDebugCopy) return; // TEMP-DEBUG: dismissal is via backdrop tap only.
      finishOnce();
    },
    [finishOnce, showDebugCopy]
  );

  // TEMP-DEBUG: "Copied ✓" feedback for the copy-debug-info button.
  const [debugCopied, setDebugCopied] = useState(false);
  const handleCopyDebugInfo = useCallback(() => {
    if (!copyAddCardDebugReport()) return;
    setDebugCopied(true);
    setTimeout(() => setDebugCopied(false), 2000);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.successModalBackdrop} onPress={finishOnce}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <Animated.View
          style={[
            styles.successModalCard,
            { opacity, transform: [{ scale }] },
          ]}
        >
          <LottieView
            style={styles.successLottie}
            source={TRANSACTION_SUCCESS}
            autoPlay
            loop={false}
            onAnimationFinish={handleAnimationFinish}
          />
          <CustomText
            variant="h5"
            fontWeight="bold"
            align="center"
            style={styles.successTitle}
          >
            {title}
          </CustomText>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.successMessage}
          >
            {message}
          </CustomText>
          {/* TEMP-DEBUG */}
          {showDebugCopy ? (
            <Pressable onPress={handleCopyDebugInfo} hitSlop={8}>
              <CustomText
                variant="caption"
                color={theme.colors.textSecondary}
                align="center"
                style={{ marginTop: theme.spacing.md, textDecorationLine: 'underline' }}
              >
                {debugCopied ? 'Copied ✓' : 'Copy debug info'}
              </CustomText>
            </Pressable>
          ) : null}
        </Animated.View>
      </Pressable>
    </Pressable>
  );
};

export default CardAddedSuccessModal;
