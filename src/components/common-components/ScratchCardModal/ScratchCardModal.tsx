import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Rect,
  Group,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useTheme } from "../../../styles/ThemeContext";
import CustomText from "../../../tsx-components/CustomText";
import { TRANSACTION_SUCCESS } from "../../../lottie/lottie";
import { IScratchCardModalProps } from "./types";
import { Theme } from "../../../styles";

// Helper function to safely format numbers
const formatAmount = (value: number | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return Number(value).toFixed(decimals);
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const SCRATCH_AREA_WIDTH = CARD_WIDTH - 40;
const SCRATCH_AREA_HEIGHT = 180;
const SCRATCH_THRESHOLD = 0.4; // 40%
const STROKE_WIDTH = 40;
const GRID_SIZE = 5;

const ScratchCardModal: React.FC<IScratchCardModalProps> = ({
  isVisible,
  onClose,
  onScratchComplete,
  card,
  isScratching,
}) => {
  const { theme } = useTheme();
  const canvasRef = useCanvasRef();
  const pathRef = useRef(Skia.Path.Make());
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  const lottieOpacity = useRef(new Animated.Value(0)).current;
  
  // Track scratched pixels
  const scratchedPixels = useRef<Set<string>>(new Set());
  const totalPixels = useRef(0);
  const isRevealedRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible && card) {
      pathRef.current = Skia.Path.Make();
      scratchedPixels.current = new Set();
      setScratchPercentage(0);
      setIsRevealed(false);
      setShowCelebration(false);
      isRevealedRef.current = false;
      lottieOpacity.setValue(0);
      
      // Calculate total pixels in grid
      const cols = Math.floor(SCRATCH_AREA_WIDTH / GRID_SIZE);
      const rows = Math.floor(SCRATCH_AREA_HEIGHT / GRID_SIZE);
      totalPixels.current = cols * rows;
    }
  }, [isVisible, card, lottieOpacity]);

  // Sync ref with state
  useEffect(() => {
    isRevealedRef.current = isRevealed;
  }, [isRevealed]);

  // Play lottie animation when celebration is triggered
  useEffect(() => {
    if (showCelebration && lottieRef.current) {
      // Reset and play the animation
      lottieRef.current.reset();
      
      // Fade in and play after a small delay to ensure proper mounting
      setTimeout(() => {
        Animated.timing(lottieOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }, 100);
    }
  }, [showCelebration, lottieOpacity]);

  const handleReveal = useCallback(() => {
    if (!isRevealedRef.current && card) {
      isRevealedRef.current = true;
      setIsRevealed(true);
      setShowCelebration(true);
      
      // Trigger the scratch complete callback
      onScratchComplete(card.id);
    }
  }, [card, onScratchComplete]);

  const updatePath = useCallback((x: number, y: number, isStart: boolean) => {
    if (isRevealedRef.current) return;
    
    if (isStart) {
      pathRef.current.moveTo(x, y);
    } else {
      pathRef.current.lineTo(x, y);
    }
    
    // Mark pixels around the stroke as scratched
    const radius = STROKE_WIDTH / 2;
    
    for (let dx = -radius; dx <= radius; dx += GRID_SIZE) {
      for (let dy = -radius; dy <= radius; dy += GRID_SIZE) {
        const px = Math.floor((x + dx) / GRID_SIZE) * GRID_SIZE;
        const py = Math.floor((y + dy) / GRID_SIZE) * GRID_SIZE;
        
        // Check if within scratch area bounds
        if (px >= 0 && px < SCRATCH_AREA_WIDTH && py >= 0 && py < SCRATCH_AREA_HEIGHT) {
          const key = `${px},${py}`;
          scratchedPixels.current.add(key);
        }
      }
    }
    
    const percentage = scratchedPixels.current.size / totalPixels.current;
    setScratchPercentage(percentage);
    
    // Check if threshold is reached
    if (percentage >= SCRATCH_THRESHOLD) {
      handleReveal();
    }
    
    // Force canvas redraw
    canvasRef.current?.redraw();
  }, [handleReveal]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      runOnJS(updatePath)(event.x, event.y, true);
    })
    .onUpdate((event) => {
      runOnJS(updatePath)(event.x, event.y, false);
    })
    .minDistance(0)
    .maxPointers(1);

  const handleClose = () => {
    if (!isScratching) {
      onClose();
    }
  };

  if (!card) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles(theme).gestureRoot}>
        <Pressable style={styles(theme).modalOverlay} onPress={handleClose}>
          <Pressable
            style={styles(theme).modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Card Header */}
            <View style={styles(theme).cardHeader}>
              <CustomText
                variant="h4"
                fontWeight="semiBold"
                color={theme.colors.text.primary}
              >
                {card.title}
              </CustomText>
              <CustomText
                variant="body2"
                color={theme.colors.text.secondary}
                style={styles(theme).cardSubtitle}
              >
                Scratch to reveal your prize!
              </CustomText>
            </View>

            {/* Scratch Area */}
            <View style={styles(theme).scratchContainer}>
              {/* Reward Content (Underneath) */}
              <View style={styles(theme).rewardContent}>
                {!showCelebration && (
                  <Animated.View 
                    style={[
                      styles(theme).lottieContainer,
                      { opacity: lottieOpacity }
                    ]}
                  >
                    <LottieView
                      ref={lottieRef}
                      source={TRANSACTION_SUCCESS}
                      style={styles(theme).lottieAnimation}
                      autoPlay={true}
                      loop={true}
                      speed={1}
                    />
                  </Animated.View>
                )}
                <CustomText
                  variant="body1"
                  color={theme.colors.palette.white}
                  style={styles(theme).youWonText}
                >
                  You Won!
                </CustomText>
                <CustomText
                  variant="h1"
                  fontWeight="bold"
                  color={theme.colors.palette.yellow500}
                  // style={styles(theme).rewardAmount}
                >
                  ${formatAmount(card.reward_amount)}
                </CustomText>
              </View>

              {/* Scratch Layer */}
              {!isRevealed && (
                <GestureDetector gesture={panGesture}>
                  <View style={styles(theme).canvasContainer}>
                    <Canvas ref={canvasRef} style={styles(theme).canvas}>
                      {/* Scratch overlay */}
                      <Rect
                        x={0}
                        y={0}
                        width={SCRATCH_AREA_WIDTH}
                        height={SCRATCH_AREA_HEIGHT}
                        color={theme.colors.palette.grey400}
                      />
                      
                      {/* Scratch pattern/text */}
                      <Group>
                        <Rect
                          x={0}
                          y={0}
                          width={SCRATCH_AREA_WIDTH}
                          height={SCRATCH_AREA_HEIGHT}
                          color={theme.colors.palette.grey300}
                        />
                      </Group>

                      {/* Eraser path */}
                      <Path
                        path={pathRef.current}
                        color="transparent"
                        style="stroke"
                        strokeWidth={STROKE_WIDTH}
                        strokeCap="round"
                        strokeJoin="round"
                        blendMode="clear"
                      />
                    </Canvas>
                    
                    {/* Scratch hint text */}
                    <View style={styles(theme).scratchHint}>
                      <CustomText
                        variant="h4"
                        fontWeight="semiBold"
                        color={theme.colors.palette.grey600}
                      >
                        Scratch Here
                      </CustomText>
                      <CustomText
                        variant="body2"
                        color={theme.colors.palette.grey500}
                        style={styles(theme).percentageText}
                      >
                        {Math.min(Math.round(scratchPercentage * 100), 100)}% scratched
                      </CustomText>
                    </View>
                  </View>
                </GestureDetector>
              )}
            </View>

            {/* Loading indicator when processing */}
            {isScratching && (
              <View style={styles(theme).loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.palette.green700}
                />
                <CustomText
                  variant="body1"
                  color={theme.colors.text.secondary}
                  style={styles(theme).loadingText}
                >
                  Processing your reward...
                </CustomText>
              </View>
            )}

            {/* Close button */}
            {(isRevealed || !isScratching) && (
              <Pressable
                style={styles(theme).closeButton}
                onPress={handleClose}
                disabled={isScratching}
              >
                <CustomText
                  variant="button"
                  fontWeight="semiBold"
                  color={theme.colors.palette.white}
                >
                  {isRevealed ? "Claim & Close" : "Cancel"}
                </CustomText>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = (theme: Theme) =>
  StyleSheet.create({
    gestureRoot: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: CARD_WIDTH,
      backgroundColor: theme.colors.palette.white,
      borderRadius: 24,
      padding: theme.spacing.spacing[5],
      alignItems: "center",
    },
    cardHeader: {
      width: "100%",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[4],
    },
    cardSubtitle: {
      marginTop: theme.spacing.spacing[1],
    },
    scratchContainer: {
      width: SCRATCH_AREA_WIDTH,
      height: SCRATCH_AREA_HEIGHT,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
    },
    rewardContent: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.palette.green700,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
    },
    lottieContainer: {
      position: "absolute",
      width: 250,
      height: 250,
      top: -40,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    lottieAnimation: {
      width: "100%",
      height: "100%",
    },
    youWonText: {
      marginBottom: theme.spacing.spacing[2],
    },
    rewardAmount: {
      fontSize: 48,
    },
    canvasContainer: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      overflow: "hidden",
    },
    canvas: {
      width: SCRATCH_AREA_WIDTH,
      height: SCRATCH_AREA_HEIGHT,
    },
    scratchHint: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      pointerEvents: "none",
    },
    percentageText: {
      marginTop: theme.spacing.spacing[2],
    },
    loadingContainer: {
      marginTop: theme.spacing.spacing[4],
      alignItems: "center",
    },
    loadingText: {
      marginTop: theme.spacing.spacing[2],
    },
    closeButton: {
      marginTop: theme.spacing.spacing[4],
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: theme.spacing.spacing[8],
      paddingVertical: theme.spacing.spacing[3],
      borderRadius: 20,
      width: "100%",
      alignItems: "center",
    },
  });

export default ScratchCardModal;
