import React from 'react';
import { Clipboard, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { scratchVoucherCardStyles } from '@new-ui/styles/components/scratchVoucherCardStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { IScratchVoucherCardProps } from './types';

const ScratchVoucherCard: React.FC<IScratchVoucherCardProps> = ({
  points,
  onPress,
  redeemed = false,
  redeemedData,
}) => {
  const { theme } = useTheme();
  const styles = scratchVoucherCardStyles(theme);

  if (redeemed && redeemedData) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.redeemedBrandIcon}>
          <AppIcon.PayairoLogoBlack width={24} height={24} />
        </View>
        <CustomText style={styles.discountText}>{redeemedData.discount}</CustomText>
        <CustomText style={styles.descriptionText}>{redeemedData.description}</CustomText>
        <View style={styles.codeRow}>
          <CustomText style={styles.codeText}>{redeemedData.code}</CustomText>
          <TouchableOpacity
            onPress={() => Clipboard.setString(redeemedData.code)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon.Copygreen width={16} height={16} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.giftCircle}>
       <AppIcon.RewardsGift width={24} height={24} />
      </View>
      <CustomText style={styles.unlockText}>Unlock a reward with</CustomText>
      <CustomText style={styles.pointsText}>{points} Points</CustomText>
    </TouchableOpacity>
  );
};

export default ScratchVoucherCard;
