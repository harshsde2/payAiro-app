import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Clipboard, Text, TouchableOpacity, View } from 'react-native';
import { Canvas, Path, Skia, BlendMode, Paint, Group, Rect } from '@shopify/react-native-skia';
import { useTheme } from '@new-ui/styles/ThemeContext';
import {
  scratchCardScreenStyles,
  SCRATCH_CARD_SIZE,
} from '@new-ui/styles/screens/rewards/scratchCardScreenStyles';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { Button } from '@new-ui/components/common-components/layout';
import { AppIcon } from '@new-ui/assets/svgs';

type CardState = 'unscratched' | 'scratched' | 'claimed';

const SCRATCH_THRESHOLD = 0.35;
const STROKE_WIDTH = 40;

const REWARD = {
  amount: '$5',
  title: '$5 joining bonus unlocked!',
  description: 'Congratulations! You have earned a joining bonus. Claim your reward to redeem.',
  brand: {
    discount: '$5.25 Off',
    description: 'Ola outstation rides',
    code: 'QWASERDF',
  },
};

const ScratchCardScreen = () => {
  const { theme } = useTheme();
  const styles = scratchCardScreenStyles(theme);
  const [cardState, setCardState] = useState<CardState>('unscratched');

  const pathRef = useRef(Skia.Path.Make());
  const [pathStr, setPathStr] = useState('');
  const scratchedPixels = useRef(0);
  const totalPixels = useMemo(() => SCRATCH_CARD_SIZE * SCRATCH_CARD_SIZE, []);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: any) => {
      if (cardState !== 'unscratched') return;
      const touch = e.nativeEvent;
      const x = touch.locationX;
      const y = touch.locationY;
      pathRef.current.moveTo(x, y);
      lastPoint.current = { x, y };
      isDrawing.current = true;
    },
    [cardState],
  );

  const handleTouchMove = useCallback(
    (e: any) => {
      if (!isDrawing.current || cardState !== 'unscratched') return;
      const touch = e.nativeEvent;
      const x = touch.locationX;
      const y = touch.locationY;
      pathRef.current.lineTo(x, y);
      setPathStr(pathRef.current.toSVGString());

      if (lastPoint.current) {
        const dx = Math.abs(x - lastPoint.current.x);
        const dy = Math.abs(y - lastPoint.current.y);
        const dist = Math.sqrt(dx * dx + dy * dy);
        scratchedPixels.current += dist * STROKE_WIDTH;
      }
      lastPoint.current = { x, y };

      if (scratchedPixels.current / totalPixels > SCRATCH_THRESHOLD) {
        setCardState('scratched');
      }
    },
    [cardState, totalPixels],
  );

  const handleTouchEnd = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  const handleClaim = useCallback(() => setCardState('claimed'), []);

  const skiaPath = useMemo(() => {
    if (!pathStr) return Skia.Path.Make();
    return Skia.Path.MakeFromSVGString(pathStr) ?? Skia.Path.Make();
  }, [pathStr]);

  const overlayPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setBlendMode(BlendMode.Clear);
    p.setStyle(1); // Stroke
    p.setStrokeWidth(STROKE_WIDTH);
    p.setStrokeCap(1); // Round
    p.setStrokeJoin(1); // Round
    return p;
  }, []);

  if (cardState === 'claimed') {
    return (
      <ScreenWrapper scrollable>
        <View style={styles.content}>
          <CustomText variant="body" fontFamily="inter" size={14} style={styles.subtitle}>
            Reward claimed successfully!
          </CustomText>

          <View style={styles.brandCard}>
            <View style={styles.brandLogoCircle}>
              <AppIcon.PayairoLogoBlack width={36} height={36} />
            </View>
            <CustomText style={styles.brandDiscount}>{REWARD.brand.discount}</CustomText>
            <CustomText style={styles.brandDescription}>{REWARD.brand.description}</CustomText>

            <View style={styles.codeFieldRow}>
              <CustomText style={styles.codeText}>{REWARD.brand.code}</CustomText>
              <TouchableOpacity
                onPress={() => Clipboard.setString(REWARD.brand.code)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon.Copygreen width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>

          <Button onPress={() => {}} style={styles.redeemButton}>
            Copy code and Redeem
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable>
      <View style={styles.content}>
        <CustomText variant="body" fontFamily="inter" size={14} style={styles.subtitle}>
          Scratch and claim your reward!
        </CustomText>

        <View style={styles.cardWrapper}>
          {/* Underlay: revealed reward content */}
          <View style={styles.underlay}>
            <Text style={styles.revealedEmoji}>🎉</Text>
            <CustomText style={styles.revealedTitle}>{REWARD.title}</CustomText>
            <CustomText style={styles.revealedDescription}>{REWARD.description}</CustomText>
          </View>

          {cardState === 'unscratched' && (
            <>
              {/* Green overlay – scratched away by Skia */}
              <View
                style={styles.giftOverlay}
                pointerEvents="none"
              >
                <Text style={styles.giftEmoji}>🎁</Text>
                <CustomText style={styles.giftText}>Scratch to reveal{'\n'}your reward!</CustomText>
              </View>

              {/* Skia canvas for erasing the overlay */}
              <View
                style={styles.overlayCanvas}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderStart={handleTouchStart}
                onResponderMove={handleTouchMove}
                onResponderRelease={handleTouchEnd}
              >
                <Canvas style={{ flex: 1 }}>
                  <Group layer={<Paint />}>
                    <Rect
                      x={0}
                      y={0}
                      width={SCRATCH_CARD_SIZE}
                      height={SCRATCH_CARD_SIZE}
                      color={theme.colors.primary}
                    />
                    <Path path={skiaPath} paint={overlayPaint} />
                  </Group>
                </Canvas>
              </View>
            </>
          )}
        </View>

        {cardState === 'scratched' && (
          <Button onPress={handleClaim} style={styles.claimButton}>
            Claim
          </Button>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default ScratchCardScreen;
