import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { AppIcon } from '@new-ui/assets/svgs';
import type { FundingSource } from './enterAmount.types';

type FundingSourceCardProps = {
  source: FundingSource | null;
  onPress: () => void;
};

const maskLast4 = (id: string): string => {
  const last4 = id.slice(-4);
  return last4 ? `•••• ${last4}` : '••••';
};

const FundingSourceCard: React.FC<FundingSourceCardProps> = ({
  source,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  const maskedLabel = useMemo(() => {
    if (!source?.id) return '';
    return maskLast4(source.id);
  }, [source?.id]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.fundingCard}
      onPress={onPress}
    >
      <View style={styles.fundingCardRow}>
        <View style={styles.fundingCardLeft}>
          {source?.name?.toLowerCase().includes('payairo') ? (
            <View style={styles.fundingCardPayairoIconCircle}>
              <AppIcon.PayairoLogoBlack width={38} height={38} />
            </View>
          ) : null}

          <View style={styles.fundingCardTextContainer}>
            <CustomText
              fontWeight="semiBold"
              size={16}
              style={styles.fundingCardName}
            >
              {source?.name || 'Select source'}
            </CustomText>
            {source?.type === 'crypto' ? (
              <CustomText
                variant="caption"
                size={13}
                color={theme.colors.textSecondary}
                style={styles.fundingCardMasked}
              >
                {source?.cryptoMeta?.symbol} balance
              </CustomText>
            ) : maskedLabel ? (
              <CustomText
                variant="caption"
                size={13}
                color={theme.colors.textSecondary}
                style={styles.fundingCardMasked}
              >
                {maskedLabel}
              </CustomText>
            ) : null}
          </View>
        </View>

        <View style={styles.fundingCardChevron}>
          <AppIcon.ChevronDown width={20} height={20} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FundingSourceCard;

