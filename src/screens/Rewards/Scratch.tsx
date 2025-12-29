import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "../../components/HeaderTitle";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { SvgIcons } from "../../constants/svgs";
import CongratulationsModal from "../../components/common-components/CongratulationsModal";
import ScratchCardModal from "../../components/common-components/ScratchCardModal";
import { NAVIGATION_SCREENS } from "../../navigations/navigationConstants";
import { IBalanceData, IRewardCard, IScratchCardHistory } from "./types";
import {
  useScratchCards,
  useScratchCard,
  useClaimScratchReward,
} from "../../query/hooks/useRewards";
import { showError } from "../../utils/toast";

// Helper function to safely format numbers
const formatAmount = (value: number | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return Number(value).toFixed(decimals);
};

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const Scratch: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [selectedReward, setSelectedReward] = useState<number>(0);
  const [scratchingCardId, setScratchingCardId] = useState<number | null>(null);
  const [showClaimCongratulations, setShowClaimCongratulations] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number>(0);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<IRewardCard | null>(null);

  const {
    data: scratchCardsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useScratchCards();

  // console.log("scratchCardsData =>",JSON.stringify(scratchCardsData, null, 2));

  const scratchCardMutation = useScratchCard();
  const claimRewardMutation = useClaimScratchReward();

  // Extract data from API response with safe defaults
  const balanceData: IBalanceData = {
    points: scratchCardsData?.data?.points_info?.available_points ?? 0,
    rewards: scratchCardsData?.data?.scratch_rewards?.available_scratch_reward ?? 0,
  };

  // Get scratch rewards data
  const scratchRewards = scratchCardsData?.data?.scratch_rewards;

  // Get history data
  const history: IScratchCardHistory[] =
    scratchCardsData?.data?.history || [];

  // Handle API errors
  useEffect(() => {
    if (isError) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to load scratch cards. Please try again.";
      showError(errorMessage);
    }
  }, [isError, error]);

  // handleScratchCardPress is now inline in the card map function

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    setScratchingCardId(null);
    // Refetch data after closing modal to update card states
    refetch();
  };

  const handleOpenScratchModal = (card: IRewardCard) => {
    if (card.can_scratch && !card.is_scratched) {
      setSelectedCard(card);
      setShowScratchModal(true);
    } else if (!card.can_scratch) {
      showError("This card cannot be scratched yet");
    } else if (card.is_scratched) {
      showError("This card has already been scratched");
    }
  };

  const handleCloseScratchModal = () => {
    setShowScratchModal(false);
    setSelectedCard(null);
    setScratchingCardId(null);
    // Refetch data after closing modal to update card states
    refetch();
  };

  const handleScratchComplete = (cardId: number) => {
    setScratchingCardId(cardId);
    scratchCardMutation.mutate(
      { card_id: cardId },
      {
        onSuccess: (data) => {
          // Try to get reward amount from the selected card first, then from API response
          const card = scratchCardsData?.data?.cards?.find((c) => c.id === cardId);
          const rewardAmount = card?.reward_amount ?? selectedCard?.reward_amount ?? 0;
          setSelectedReward(rewardAmount);
          
          // Don't close scratch modal or show congratulations modal here
          // ScratchCardModal already shows the reward when 40% is scratched
          // User will close the modal manually after seeing the result
          setScratchingCardId(null);
        },
        onError: () => {
          setShowScratchModal(false);
          setSelectedCard(null);
          setScratchingCardId(null);
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer padding={0} scrollable={true}>
        <HeaderTitle title="Rewards" leftIcon={"true"} />
        <View style={[styles(theme).container, styles(theme).loadingContainer]}>
          <ActivityIndicator
            size="large"
            color={theme.colors.palette.green700}
          />
          <CustomText
            variant="body1"
            color={theme.colors.text.secondary}
            style={styles(theme).loadingText}
          >
            Loading scratch cards...
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  // Error state with retry option
  if (isError && !scratchCardsData) {
    return (
      <ScreenContainer padding={0} scrollable={true}>
        <HeaderTitle title="Rewards" leftIcon={"true"} />
        <View style={[styles(theme).container, styles(theme).errorContainer]}>
          <CustomText
            variant="h4"
            fontWeight="semiBold"
            color={theme.colors.text.primary}
            style={styles(theme).errorTitle}
          >
            Failed to load scratch cards
          </CustomText>
          <CustomText
            variant="body2"
            color={theme.colors.text.secondary}
            style={styles(theme).errorMessage}
          >
            {(error as any)?.response?.data?.message ||
              (error as any)?.message ||
              "Please try again"}
          </CustomText>
          <Pressable
            style={styles(theme).retryButton}
            onPress={() => refetch()}
          >
            <CustomText
              variant="button"
              fontWeight="semiBold"
              color={theme.colors.palette.white}
            >
              Retry
            </CustomText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // Empty state
  if (!scratchCardsData?.data?.cards || scratchCardsData.data.cards.length === 0) {
    return (
      <ScreenContainer padding={0} scrollable={true}>
        <HeaderTitle title="Rewards" leftIcon={"true"} />
        <View style={[styles(theme).container, styles(theme).emptyContainer]}>
          <CustomText
            variant="h4"
            fontWeight="semiBold"
            color={theme.colors.text.primary}
            style={styles(theme).emptyTitle}
          >
            No scratch cards available
          </CustomText>
          <CustomText
            variant="body2"
            color={theme.colors.text.secondary}
            style={styles(theme).emptyMessage}
          >
            Check back later for new rewards
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padding={0} >
      <HeaderTitle title="Rewards" leftIcon={"true"} />

      <ScrollView style={styles(theme).container}>
        {/* Your Balances Section */}
        <View style={styles(theme).balancesContainer}>
          <View style={styles(theme).balancesHeader}>
            <CustomText
              variant="h4"
              fontWeight="semiBold"
              color={theme.colors.palette.white}
            >
              Your Balance
            </CustomText>
            <Pressable
              onPress={() => navigation.navigate(NAVIGATION_SCREENS.HOW_TO_EARN_POINTS)}
              style={{ transform: [{ rotate: "180deg" }] }}
            >
              <SvgIcons.ToastCircleAlert width={24} height={24} />
            </Pressable>
          </View>
          <View style={styles(theme).balancesContent}>
            <View style={styles(theme).balanceItem}>
              <View style={styles(theme).iconContainer}>
                <SvgIcons.Points width={32} height={32} />
                <CustomText
                  variant="body2"
                  color={theme.colors.palette.white}
                  style={styles(theme).balanceLabel}
                >
                  Points
                </CustomText>
              </View>
              <CustomText
                variant="h2"
                fontWeight="bold"
                color={theme.colors.palette.white}
              >
                {formatAmount(balanceData.points)}
              </CustomText>
            </View>
            <View style={styles(theme).balanceItem}>
              <View style={styles(theme).iconContainer}>
                <SvgIcons.RewardsDollar width={32} height={32} />
                <CustomText
                  variant="body2"
                  color={theme.colors.palette.white}
                  style={styles(theme).balanceLabel}
                >
                  Rewards
                </CustomText>
              </View>
              <CustomText
                variant="h2"
                fontWeight="bold"
                color={theme.colors.palette.white}
              >
                ${formatAmount(balanceData.rewards)}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Scratch Vouchers Section */}
        <View style={styles(theme).vouchersSection}>
          <CustomText
            variant="h4"
            fontWeight="semiBold"
            style={styles(theme).sectionTitle}
          >
            Scratch Vouchers
          </CustomText>
          <CustomText
            variant="body2"
            color={theme.colors.text.secondary}
            style={styles(theme).sectionSubtitle}
          >
            Use your points to unlock rewards
          </CustomText>

          {/* Reward Cards - Horizontal Scrolling */}
          {scratchCardsData?.data?.cards && scratchCardsData.data.cards.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles(theme).cardsScrollContainer}
              style={styles(theme).cardsScrollView}
            >
              {scratchCardsData.data.cards.map((card) => {
                const isCurrentlyScratching =
                  scratchCardMutation.isPending && scratchingCardId === card.id;
                
                const isCardDisabled = !card.can_scratch || card.is_scratched || isCurrentlyScratching;

                return (
                  <Pressable
                    key={card.id}
                    style={[
                      styles(theme).rewardCard,
                      isCardDisabled &&
                        styles(theme).rewardCardDisabled,
                    ]}
                    onPress={() => handleOpenScratchModal(card)}
                    disabled={isCardDisabled}
                  >
                    <View style={styles(theme).rewardCardHeader}>
                      <View style={styles(theme).rewardIconContainer}>
                        <SvgIcons.RewardsGifts width={24} height={24} />
                      </View>
                      <CustomText
                        variant="h4"
                        fontWeight="semiBold"
                        style={styles(theme).rewardCardTitle}
                      >
                        {card.title}
                      </CustomText>
                    </View>
                    <View style={styles(theme).rewardCardInner}>
                      {isCurrentlyScratching ? (
                        <View style={styles(theme).scratchingContainer}>
                          <ActivityIndicator
                            size="large"
                            color={theme.colors.palette.yellow500}
                          />
                          <CustomText
                            variant="body1"
                            color={theme.colors.palette.white}
                            style={styles(theme).scratchingText}
                          >
                            Scratching...
                          </CustomText>
                        </View>
                      ) : (
                        <>
                          <View style={styles(theme).dotsContainer}>
                            <View style={styles(theme).dot} />
                            <View style={styles(theme).dot} />
                            <View style={styles(theme).dot} />
                          </View>
                          <CustomText
                            variant="body1"
                            color={theme.colors.palette.white}
                            style={styles(theme).unlockText}
                          >
                            Unlock a reward with
                          </CustomText>
                          <CustomText
                            variant="h2"
                            fontWeight="bold"
                            color={theme.colors.palette.white}
                            style={styles(theme).pointsText}
                          >
                            {card.points_required} Points
                          </CustomText>
                          <CustomText
                            variant="body2"
                            color={theme.colors.palette.yellow200}
                            style={styles(theme).scratchText}
                          >
                            {card.is_scratched
                              ? "Already scratched"
                              : card.can_scratch
                              ? "Scratch to reveal your prize"
                              : "Not enough points"}
                          </CustomText>
                          {card.is_scratched && (
                            <CustomText
                              variant="body2"
                              color={theme.colors.palette.white}
                              style={styles(theme).rewardAmountText}
                            >
                              Reward: ${formatAmount(card.reward_amount)}
                            </CustomText>
                          )}
                        </>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles(theme).noCardContainer}>
              <CustomText
                variant="body2"
                color={theme.colors.text.secondary}
                style={styles(theme).noCardText}
              >
                No reward cards available
              </CustomText>
            </View>
          )}
        </View>

        {/* History Section */}
        {history.length > 0 && (
          <View style={styles(theme).historySection}>
            <CustomText
              variant="h4"
              fontWeight="semiBold"
              style={styles(theme).sectionTitle}
            >
              Scratch History
            </CustomText>
            <CustomText
              variant="body2"
              color={theme.colors.text.secondary}
              style={styles(theme).sectionSubtitle}
            >
              Your past scratch card activities
            </CustomText>

            {history.map((item) => (
              <View key={item.id} style={styles(theme).historyItem}>
                <View style={styles(theme).historyItemHeader}>
                  <View style={styles(theme).historyIconContainer}>
                    <SvgIcons.RewardsGifts width={20} height={20} />
                  </View>
                  <View style={styles(theme).historyItemContent}>
                    <CustomText
                      variant="body1"
                      fontWeight="semiBold"
                      color={theme.colors.text.primary}
                    >
                      {item.scratch_card.title}
                    </CustomText>
                    <CustomText
                      variant="body2"
                      color={theme.colors.text.secondary}
                      style={styles(theme).historyDate}
                    >
                      {formatDate(item.scratched_at)}
                    </CustomText>
                  </View>
                </View>
                <View style={styles(theme).historyItemDetails}>
                  <View style={styles(theme).historyDetailRow}>
                    <CustomText
                      variant="body2"
                      color={theme.colors.text.secondary}
                    >
                      Points Used:
                    </CustomText>
                    <CustomText
                      variant="body2"
                      fontWeight="semiBold"
                      color={theme.colors.text.primary}
                    >
                      {item.points_used}
                    </CustomText>
                  </View>
                  <View style={styles(theme).historyDetailRow}>
                    <CustomText
                      variant="body2"
                      color={theme.colors.text.secondary}
                    >
                      Reward Received:
                    </CustomText>
                    <CustomText
                      variant="body2"
                      fontWeight="semiBold"
                      color={
                        item.reward_received
                          ? theme.colors.palette.green700
                          : theme.colors.text.secondary
                      }
                    >
                      ${formatAmount(item.scratch_card?.reward_amount)}
                    </CustomText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Scratch Rewards Summary */}
        {scratchRewards && (
          <View style={styles(theme).rewardsSummarySection}>
            <CustomText
              variant="h4"
              fontWeight="semiBold"
              style={styles(theme).sectionTitle}
            >
              Scratched Rewards Summary
            </CustomText>
            <View style={styles(theme).summaryContainer}>
              <View style={styles(theme).summaryItem}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                  style={styles(theme).summaryLabel}
                >
                  Redeemed Cards
                </CustomText>
                <CustomText
                  variant="h3"
                  fontWeight="bold"
                  color={theme.colors.text.primary}
                >
                  {scratchRewards.total_scratched}
                </CustomText>
              </View>
              <View style={styles(theme).summaryItem}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                  style={styles(theme).summaryLabel}
                >
                  Total Rewards
                </CustomText>
                <CustomText
                  variant="h3"
                  fontWeight="bold"
                  color={theme.colors.text.primary}
                >
                  ${formatAmount(scratchRewards.total_scratched_reward)}
                </CustomText>
              </View>
              <View style={styles(theme).summaryItem}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                  style={styles(theme).summaryLabel}
                >
                  Claimed
                </CustomText>
                <CustomText
                  variant="h3"
                  fontWeight="bold"
                  color={theme.colors.text.primary}
                >
                  ${formatAmount(scratchRewards.scratch_reward_claimed)}
                </CustomText>
              </View>
              <View style={styles(theme).summaryItem}>
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                  style={styles(theme).summaryLabel}
                >
                  Available
                </CustomText>
                <CustomText
                  variant="h3"
                  fontWeight="bold"
                  color={theme.colors.palette.green700}
                >
                  ${formatAmount(scratchRewards.available_scratch_reward)}
                </CustomText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Claim Button */}
      {scratchRewards &&
        scratchRewards.available_scratch_reward > 0 &&
        scratchRewards.can_claim && (
          <View style={styles(theme).floatingButtonContainer}>
            <Pressable
              style={[
                styles(theme).floatingButton,
                claimRewardMutation.isPending && styles(theme).claimButtonDisabled,
              ]}
              onPress={() => {
                if (!claimRewardMutation.isPending) {
                  claimRewardMutation.mutate(undefined, {
                    onSuccess: (data) => {
                      // Extract claim amount from response
                      const claimAmount =
                        data?.data?.data?.claim_amount ||
                        data?.data?.claim_amount ||
                        scratchRewards.available_scratch_reward;
                      setClaimedAmount(claimAmount);
                      setShowClaimCongratulations(true);
                    },
                    onError: () => {
                      // Error toast is already handled in the mutation hook
                    },
                  });
                }
              }}
              disabled={claimRewardMutation.isPending}
            >
              {claimRewardMutation.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.palette.white}
                />
              ) : (
                <CustomText
                  variant="button"
                  fontWeight="semiBold"
                  color={theme.colors.palette.white}
                >
                  Claim ${formatAmount(scratchRewards.available_scratch_reward)}
                </CustomText>
              )}
            </Pressable>
          </View>
        )}

      <ScratchCardModal
        isVisible={showScratchModal}
        onClose={handleCloseScratchModal}
        onScratchComplete={handleScratchComplete}
        card={selectedCard}
        isScratching={scratchCardMutation.isPending}
      />
      <CongratulationsModal
        isVisible={showCongratulations}
        onClose={handleCloseCongratulations}
        rewardAmount={selectedReward}
      />
      <CongratulationsModal
        isVisible={showClaimCongratulations}
        onClose={() => {
          setShowClaimCongratulations(false);
          setClaimedAmount(0);
          // Refetch data after closing modal to update rewards
          refetch();
        }}
        rewardAmount={claimedAmount}
      />
    </ScreenContainer>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    scrollContent: {
      flex: 1,

      paddingBottom: theme.spacing.spacing[6],
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      paddingBottom: 100, // Add bottom padding to prevent content from being hidden behind floating button
      // marginTop: theme.spacing.spacing.md,
    },
    balancesContainer: {
      backgroundColor: theme.colors.palette.green700,
      borderRadius: 20,
      padding: theme.spacing.spacing[5],
      margin: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[4],
    },
    balancesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[4],
    },
    balancesContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    balanceItem: {
      flex: 1,
      alignItems: "flex-start",
      gap: theme.spacing.spacing[2],
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.spacing[2],
      justifyContent: "center",
    },
    balanceLabel: {
      marginBottom: theme.spacing.spacing[1],
      fontSize: 14,
    },
    vouchersSection: {
      paddingHorizontal: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[4],
    },
    sectionTitle: {
      marginBottom: theme.spacing.spacing[1],
    },
    sectionSubtitle: {
      marginBottom: theme.spacing.spacing[4],
      fontSize: 14,
    },
    cardsScrollView: {
      marginHorizontal: -theme.spacing.spacing[5],
    },
    cardsScrollContainer: {
      paddingHorizontal: theme.spacing.spacing[5],
      paddingVertical: theme.spacing.spacing[2],
    },
    rewardCard: {
      backgroundColor: theme.colors.palette.yellow500,
      borderRadius: 20,
      padding: theme.spacing.spacing[4],
      width: 280,
      marginRight: theme.spacing.spacing[3],
    },
    rewardCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[3],
    },
    rewardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.palette.green700,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.spacing[2],
    },
    rewardCardTitle: {
      fontSize: 18,
    },
    rewardCardInner: {
      backgroundColor: theme.colors.palette.green700,
      borderRadius: 16,
      padding: theme.spacing.spacing[5],
      alignItems: "center",
    },
    dotsContainer: {
      flexDirection: "row",
      marginBottom: theme.spacing.spacing[3],
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.palette.yellow500,
      marginHorizontal: 4,
    },
    unlockText: {
      marginBottom: theme.spacing.spacing[2],
      fontSize: 16,
    },
    pointsText: {
      marginBottom: theme.spacing.spacing[3],
      fontSize: 28,
    },
    scratchText: {
      fontSize: 14,
    },
    rewardAmountText: {
      marginTop: theme.spacing.spacing[2],
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[10],
    },
    loadingText: {
      marginTop: theme.spacing.spacing[4],
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[10],
      paddingHorizontal: theme.spacing.spacing[5],
    },
    errorTitle: {
      marginBottom: theme.spacing.spacing[2],
      textAlign: "center",
    },
    errorMessage: {
      marginBottom: theme.spacing.spacing[6],
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: theme.spacing.spacing[6],
      paddingVertical: theme.spacing.spacing[3],
      borderRadius: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[10],
    },
    emptyTitle: {
      marginBottom: theme.spacing.spacing[2],
      textAlign: "center",
    },
    emptyMessage: {
      textAlign: "center",
    },
    noCardContainer: {
      padding: theme.spacing.spacing[5],
      alignItems: "center",
    },
    noCardText: {
      textAlign: "center",
    },
    rewardCardDisabled: {
      opacity: 0.6,
    },
    scratchingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.spacing[4],
    },
    scratchingText: {
      marginTop: theme.spacing.spacing[3],
      fontSize: 16,
    },
    historySection: {
      paddingHorizontal: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[6],
    },
    historyItem: {
      backgroundColor: theme.colors.palette.white,
      borderRadius: 16,
      padding: theme.spacing.spacing[4],
      marginTop: theme.spacing.spacing[3],
      borderWidth: 1,
      borderColor: theme.colors.palette.gray200 || "#E5E5E5",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    historyItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.spacing[3],
    },
    historyIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.palette.green700,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.spacing[3],
    },
    historyItemContent: {
      flex: 1,
    },
    historyDate: {
      marginTop: theme.spacing.spacing[1],
      fontSize: 12,
    },
    historyItemDetails: {
      gap: theme.spacing.spacing[2],
    },
    historyDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    rewardsSummarySection: {
      paddingHorizontal: theme.spacing.spacing[5],
      marginTop: theme.spacing.spacing[6],
      marginBottom: 100,
    },
    summaryContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: theme.spacing.spacing[3],
      gap: theme.spacing.spacing[3],
      // backgroundColor: "red",
    },
    summaryItem: {
      width: "45%",
      backgroundColor: theme.colors.palette.gray100 || "#F5F5F5",
      borderRadius: 12,
      padding: theme.spacing.spacing[3],
      alignItems: "center",
    },
    summaryLabel: {
      marginBottom: theme.spacing.spacing[1],
      fontSize: 12,
      textAlign: "center",
    },
    floatingButtonContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.spacing[3],
      paddingBottom: theme.spacing.spacing[2],
      backgroundColor: theme.colors.palette.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.palette.gray200 || "#E5E5E5",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    floatingButton: {
      backgroundColor: theme.colors.palette.green700,
      borderRadius: 20,
      padding: theme.spacing.spacing[3],
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      width: "100%",
    },
    claimButtonDisabled: {
      opacity: 0.7,
    },
  });

export default Scratch;
