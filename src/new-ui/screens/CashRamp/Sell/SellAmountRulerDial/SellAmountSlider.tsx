import React, { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import {
  SELL_SLIDER_THUMB_SIZE,
  sellAmountSliderStyles,
} from "@new-ui/styles/screens/cashRamp/sellAmountRulerStyles";
import {
  SELL_AMOUNT_INCREMENT_HINT,
  SELL_SINGLE_STEP_HINT,
} from "../sellFlowCopy";
import {
  formatUsd,
  getSellMaxSelectableUsd,
  getSellStepCount,
  SELL_MIN_AMOUNT_USD,
  sellStepIndexFromUsd,
  usdFromSellStepIndex,
} from "../sellFlow.utils";

const SNAP_TIMING_CONFIG = {
  duration: 120,
  easing: Easing.out(Easing.cubic),
};

export type SellAmountSliderProps = {
  maxUsd: number;
  valueUsd: number;
  onChange: (usd: number) => void;
  disabled?: boolean;
};

function indexToProgressJs(index: number, stepCount: number): number {
  if (stepCount <= 1) return 0;
  return index / (stepCount - 1);
}

function indexToProgress(index: number, stepCount: number): number {
  "worklet";
  if (stepCount <= 1) return 0;
  return index / (stepCount - 1);
}

function progressToIndex(progress: number, stepCount: number): number {
  "worklet";
  if (stepCount <= 1) return 0;
  return Math.round(Math.min(1, Math.max(0, progress)) * (stepCount - 1));
}

const SellAmountSlider: React.FC<SellAmountSliderProps> = ({
  maxUsd,
  valueUsd,
  onChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = sellAmountSliderStyles(theme);

  const stepCount = getSellStepCount(maxUsd);
  const canDrag = stepCount >= 2 && !disabled;

  const [displayUsd, setDisplayUsd] = useState(
    valueUsd >= SELL_MIN_AMOUNT_USD ? valueUsd : SELL_MIN_AMOUNT_USD
  );

  const progress = useSharedValue(0);
  const trackWidthSv = useSharedValue(0);
  const stepCountSv = useSharedValue(stepCount);
  const panStartProgress = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    stepCountSv.value = stepCount;
  }, [stepCount, stepCountSv]);

  const applyIndex = useCallback(
    (index: number, notifyParent: boolean) => {
      const usd = usdFromSellStepIndex(index);
      setDisplayUsd(usd);
      if (notifyParent) onChange(usd);
    },
    [onChange]
  );

  const syncProgressFromValueUsd = useCallback(() => {
    if (stepCount <= 0) return;
    const idx = sellStepIndexFromUsd(valueUsd, maxUsd);
    const snapped = indexToProgressJs(idx, stepCount);
    progress.value = snapped;
    setDisplayUsd(usdFromSellStepIndex(idx));
  }, [maxUsd, progress, stepCount, valueUsd]);

  useEffect(() => {
    syncProgressFromValueUsd();
  }, [maxUsd, stepCount]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    syncProgressFromValueUsd();
  }, [valueUsd, syncProgressFromValueUsd]);

  const commitIndex = useCallback(
    (index: number) => {
      const snapped = indexToProgressJs(index, stepCount);
      progress.value = snapped;
      applyIndex(index, true);
      isDraggingRef.current = false;
    },
    [applyIndex, progress, stepCount]
  );

  const previewIndex = useCallback(
    (index: number) => {
      applyIndex(index, false);
    },
    [applyIndex]
  );

  useAnimatedReaction(
    () => {
      if (!isDragging.value) return -1;
      return progressToIndex(progress.value, stepCountSv.value);
    },
    (idx, prev) => {
      if (idx < 0 || idx === prev) return;
      runOnJS(previewIndex)(idx);
    }
  );

  const onTrackLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0) {
        trackWidthSv.value = w;
      }
    },
    [trackWidthSv]
  );

  const panGesture = Gesture.Pan()
    .enabled(canDrag)
    .onBegin(() => {
      isDraggingRef.current = true;
      panStartProgress.value = progress.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const w = trackWidthSv.value;
      const travel = w - SELL_SLIDER_THUMB_SIZE;
      if (travel <= 0) return;
      const next = panStartProgress.value + e.translationX / travel;
      progress.value = Math.min(1, Math.max(0, next));
    })
    .onEnd(() => {
      isDragging.value = false;
      const count = stepCountSv.value;
      const idx = progressToIndex(progress.value, count);
      const snapped = indexToProgress(idx, count);
      progress.value = withTiming(snapped, SNAP_TIMING_CONFIG);
      runOnJS(commitIndex)(idx);
    });

  const thumbStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, trackWidthSv.value - SELL_SLIDER_THUMB_SIZE);
    return {
      transform: [{ translateX: progress.value * travel }],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, trackWidthSv.value - SELL_SLIDER_THUMB_SIZE);
    const thumbX = progress.value * travel;
    return {
      width: thumbX + SELL_SLIDER_THUMB_SIZE / 2,
    };
  });

  const minLabel = formatUsd(SELL_MIN_AMOUNT_USD);
  const maxLabel = formatUsd(
    getSellMaxSelectableUsd(maxUsd) || SELL_MIN_AMOUNT_USD
  );

  if (disabled || stepCount <= 0) {
    return (
      <View style={styles.block}>
        <View style={styles.amountRow}>
          <CustomText variant="h1" size={40} fontWeight="bold" style={styles.amountValue}>
            —
          </CustomText>
        </View>
        <CustomText variant="caption" style={styles.hint}>
          {SELL_AMOUNT_INCREMENT_HINT}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <View style={styles.amountRow}>
        <CustomText variant="h1" size={40} fontWeight="bold" style={styles.amountValue}>
          {formatUsd(displayUsd >= SELL_MIN_AMOUNT_USD ? displayUsd : SELL_MIN_AMOUNT_USD)}
        </CustomText>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.trackHitArea} onLayout={onTrackLayout}>
          <View style={styles.trackRow}>
            <View style={styles.track} />
            <Animated.View style={[styles.trackFill, fillStyle]} />
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </View>
      </GestureDetector>

      <View style={styles.rangeRow}>
        <CustomText variant="caption" style={styles.rangeLabel}>
          {minLabel}
        </CustomText>
        <CustomText variant="caption" style={styles.rangeLabel}>
          {maxLabel}
        </CustomText>
      </View>

      {stepCount <= 1 ? (
        <CustomText variant="caption" style={styles.singleStepHint}>
          {SELL_SINGLE_STEP_HINT}
        </CustomText>
      ) : null}

      <CustomText variant="caption" style={styles.hint}>
        {SELL_AMOUNT_INCREMENT_HINT}
      </CustomText>
    </View>
  );
};

export default SellAmountSlider;
