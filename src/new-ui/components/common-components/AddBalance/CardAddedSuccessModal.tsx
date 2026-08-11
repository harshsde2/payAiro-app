import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { TRANSACTION_SUCCESS } from 'lottie/lottie';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

const ENTRANCE_MS = 280;

export type CardAddedSuccessModalProps = {
  visible: boolean;
  onComplete: () => void;
  title?: string;
  message?: string;
  infoNote?: string;
  buttonLabel?: string;
};

const CardAddedSuccessModal: React.FC<CardAddedSuccessModalProps> = ({
  visible,
  onComplete,
  title = 'Card Added Successfully',
  message = 'Your card is being verified.',
  infoNote = "Verifying your card can take 2–3 minutes — avoid paying with it until then, or the payment may fail. We'll notify you once it's verified.",
  buttonLabel = 'Got it',
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const completedRef = useRef(false);

  // The modal stays open until the user taps "Got it" (no auto-dismiss), so they have time to
  // read the verification note.
  const finishOnce = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      completedRef.current = false;
      opacity.setValue(0);
      scale.setValue(0.96);
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
  }, [visible, opacity, scale]);

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.successModalBackdrop}>
      <Pressable
        style={{ width: '100%', alignItems: 'center' }}
        onPress={(e) => e.stopPropagation()}
      >
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
          {infoNote ? (
            <CustomText
              variant="caption"
              fontFamily="inter"
              color={theme.colors.textSecondary}
              align="center"
              style={{ marginTop: theme.spacing.sm, lineHeight: 18 }}
            >
              {infoNote}
            </CustomText>
          ) : null}

          <View style={{ width: '100%', marginTop: theme.spacing.lg }}>
            <Button onPress={finishOnce}>{buttonLabel}</Button>
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
};

export default CardAddedSuccessModal;
