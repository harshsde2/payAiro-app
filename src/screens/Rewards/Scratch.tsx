import React, { useState } from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "../../components/HeaderTitle";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { SvgIcons } from "../../constants/svgs";
import CongratulationsModal from "../../components/common-components/CongratulationsModal";
import HowToEarnPointsModal from "../../components/common-components/HowToEarnPointsModal";
import { IBalanceData, IRewardCard } from "./types";

const Scratch: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [selectedReward, setSelectedReward] = useState<number>(0);
  const [showHowToEarnPoints, setShowHowToEarnPoints] = useState(false);

  const balanceData: IBalanceData = {
    points: 600,
    rewards: 0,
  };

  const rewardCard: IRewardCard = {
    id: "1",
    title: "Reward",
    pointsRequired: 500,
    rewardAmount: 5,
  };

  const handleScratchCardPress = () => {
    // Simulate winning
    setSelectedReward(rewardCard.rewardAmount);
    setShowCongratulations(true);
  };

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
  };

  return (
    <ScreenContainer padding={0} scrollable={true}>
      <HeaderTitle title="Rewards" leftIcon={"true"} />

      <View style={styles(theme).container}>
        {/* Your Balances Section */}
        <View style={styles(theme).balancesContainer}>
          <View style={styles(theme).balancesHeader}>
            <CustomText
              variant="h4"
              fontWeight="semiBold"
              color={theme.colors.palette.white}
            >
              Your Balances
            </CustomText>
            <Pressable
              onPress={() => setShowHowToEarnPoints(true)}
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
                {balanceData.points}
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
                ${balanceData.rewards}
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

          {/* Reward Card */}
          <Pressable
            style={styles(theme).rewardCard}
            onPress={handleScratchCardPress}
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
                Reward
              </CustomText>
            </View>
            <View style={styles(theme).rewardCardInner}>
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
                {rewardCard.pointsRequired} Points
              </CustomText>
              <CustomText
                variant="body2"
                color={theme.colors.palette.yellow200}
                style={styles(theme).scratchText}
              >
                Scratch to reveal your prize
              </CustomText>
            </View>
          </Pressable>
        </View>
      </View>

      <CongratulationsModal
        isVisible={showCongratulations}
        onClose={handleCloseCongratulations}
        rewardAmount={selectedReward}
      />
      <HowToEarnPointsModal
        isVisible={showHowToEarnPoints}
        onClose={() => setShowHowToEarnPoints(false)}
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
    rewardCard: {
      backgroundColor: theme.colors.palette.yellow500,
      borderRadius: 20,
      padding: theme.spacing.spacing[4],
      marginTop: theme.spacing.spacing[2],
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
  });

export default Scratch;
