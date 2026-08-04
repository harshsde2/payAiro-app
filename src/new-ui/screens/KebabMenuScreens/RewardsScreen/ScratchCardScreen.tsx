import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
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
import { useScratchCard, useClaimPoints } from 'query/hooks/useRewardsApi';

type CardState = 'unscratched' | 'scratched' | 'claimed';
type Point = { x: number; y: number };

const SCRATCH_THRESHOLD = 0.35;
const STROKE_WIDTH = 40;

const ScratchCardScreen = () => {
  const { theme } = useTheme();
  const styles = scratchCardScreenStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const cardId = route.params?.cardId;
  const routePoints: number = route.params?.points ?? 0;

  const [cardState, setCardState] = useState<CardState>('unscratched');

  const scratch = useScratchCard();
  const claim = useClaimPoints();

  // Points actually earned: prefer the scratch API response, fall back to route param.
  const earnedPoints =
    scratch.data?.data?.reward_points ?? routePoints;

  // --- Smooth scratch gesture (UI thread; no per-frame React re-render) ---
  const points = useSharedValue<Point[]>([]);
  const scratchedDistance = useSharedValue(0);
  const totalPixels = useMemo(
    () => SCRATCH_CARD_SIZE * SCRATCH_CARD_SIZE,
    [],
  );

  // Guard so the scratch API + state flip happen exactly once.
  const scratchedRef = useRef(false);

  const onScratchedEnough = useCallback(() => {
    if (scratchedRef.current) return;
    scratchedRef.current = true;
    setCardState('scratched');
    if (cardId != null) scratch.mutate(cardId);
  }, [cardId, scratch]);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const pts = points.value;
    if (pts.length > 0) {
      p.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        p.lineTo(pts[i].x, pts[i].y);
      }
    }
    return p;
  }, [points]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(cardState === 'unscratched')
        .onStart((e) => {
          points.value = [{ x: e.x, y: e.y }];
        })
        .onUpdate((e) => {
          const prev = points.value;
          const last = prev[prev.length - 1];
          if (last) {
            const dx = e.x - last.x;
            const dy = e.y - last.y;
            scratchedDistance.value += Math.sqrt(dx * dx + dy * dy) * STROKE_WIDTH;
          }
          points.value = [...prev, { x: e.x, y: e.y }];
          if (scratchedDistance.value / totalPixels > SCRATCH_THRESHOLD) {
            runOnJS(onScratchedEnough)();
          }
        }),
    [cardState, totalPixels, onScratchedEnough, points, scratchedDistance],
  );

  const overlayPaint = useMemo(() => {
    const p = Skia.Paint();
    p.setBlendMode(BlendMode.Clear);
    p.setStyle(1); // Stroke
    p.setStrokeWidth(STROKE_WIDTH);
    p.setStrokeCap(1); // Round
    p.setStrokeJoin(1); // Round
    return p;
  }, []);

  const handleClaim = useCallback(() => {
    claim.mutate(undefined, {
      onSuccess: () => setCardState('claimed'),
    });
  }, [claim]);

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
            <CustomText style={styles.brandDiscount}>{earnedPoints} pts</CustomText>
            <CustomText style={styles.brandDescription}>
              Added to your PayAiro rewards balance.
            </CustomText>
          </View>

          <Button onPress={() => navigation.goBack()} style={styles.redeemButton}>
            Done
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
            <AppIcon.RewardsGift width={24} height={24} />
            <CustomText style={styles.revealedTitle}>
              {earnedPoints} points unlocked!
            </CustomText>
            <CustomText style={styles.revealedDescription}>
              Congratulations! Claim your reward to add these points to your balance.
            </CustomText>
          </View>

          {cardState === 'unscratched' && (
            <>
              {/* Skia green scratch surface, erased by the pan gesture to reveal the
                  reward `underlay` beneath. No separate same-color overlay View — that
                  only hid the reward behind an identical green, making scratching look
                  like it did nothing. */}
              <GestureDetector gesture={panGesture}>
                <View style={styles.overlayCanvas}>
                  <Canvas style={{ flex: 1 }}>
                    <Group layer={<Paint />}>
                      <Rect
                        x={0}
                        y={0}
                        width={SCRATCH_CARD_SIZE}
                        height={SCRATCH_CARD_SIZE}
                        color={theme.colors.primary}
                      />
                      <Path path={path} paint={overlayPaint} />
                    </Group>
                  </Canvas>
                </View>
              </GestureDetector>
            </>
          )}
        </View>

        {cardState === 'scratched' && (
          <Button
            onPress={handleClaim}
            loading={claim.isPending}
            style={styles.claimButton}
          >
            Claim
          </Button>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default ScratchCardScreen;
