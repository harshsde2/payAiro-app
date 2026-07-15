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
  readOnly?: boolean;
  maskedSubtitle?: string;
  /** Optional heading shown at the top of the card, e.g. "Select Crypto". */
  label?: string;
};

const maskLast4 = (id: string): string => {
  const last4 = id.slice(-4);
  return last4 ? `•••• ${last4}` : '••••';
};

const FundingSourceCard: React.FC<FundingSourceCardProps> = ({
  source,
  onPress,
  readOnly = false,
  maskedSubtitle,
  label,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  const maskedLabel = useMemo(() => {
    const hint = source?.accountMaskHint?.trim();
    if (hint && hint.length >= 4) {
      const digits = hint.replace(/\D/g, '');
      const last4 = (digits.length >= 4 ? digits : hint).slice(-4);
      return last4 ? `•••• ${last4}` : '';
    }
    if (!source?.id) return '';
    return maskLast4(source.id);
  }, [source?.accountMaskHint, source?.id]);

  const bankSubtitle = readOnly
    ? maskedSubtitle ?? '**** **** **** ****'
    : maskedLabel;

  const showPayairoIcon =
    !!source?.name?.toLowerCase().includes('payairo') ||
    !!source?.isPayairoFunding ||
    readOnly;

  const inner = (
    <>
      {label ? (
        <CustomText
          variant="h4"
          size={16}
          fontWeight="semiBold"
          fontFamily="poppins"
          color={theme.colors.primary}
          style={styles.fundingCardLabel}
        >
          {label}
        </CustomText>
      ) : null}
      <View style={styles.fundingCardRow}>
        <View style={styles.fundingCardLeft}>
        {showPayairoIcon ? (
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
              {source?.cryptoMeta?.maxUsdBalance}
            </CustomText>
          ) : bankSubtitle ? (
            <CustomText
              variant="caption"
              size={13}
              color={theme.colors.textSecondary}
              style={styles.fundingCardMasked}
            >
              {bankSubtitle}
            </CustomText>
          ) : null}
        </View>
      </View>

      {!readOnly ? (
        // Only the dropdown arrow opens the crypto list (the rest of the card is inert),
        // so tapping the card body doesn't accidentally open the selector.
        <TouchableOpacity
          style={styles.fundingCardChevron}
          activeOpacity={0.7}
          onPress={onPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppIcon.ChevronDown width={20} height={20} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : null}
      </View>
    </>
  );

  // The whole card is no longer pressable — only the chevron above opens the selector.
  return <View style={styles.fundingCard}>{inner}</View>;
};

export default FundingSourceCard;
