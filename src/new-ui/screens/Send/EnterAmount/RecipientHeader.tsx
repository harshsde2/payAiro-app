import React, { useMemo } from 'react';
import { View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { ISendContactItem } from 'new-ui/components/common-components/SendContactsList';

type RecipientHeaderProps = {
  recipient_identifier: string;
  type?: 'request' | 'send';
  selectedContact?: ISendContactItem;
  mode?: 'send' | 'trade';
  tradeMode?: 'buy' | 'sell';
  assetSymbol?: string;
  pricePreview?: string;
  /** Fiat-style withdrawal: no asset ticker or per-coin price line. */
  fiatCashout?: boolean;
  fiatCashoutTitle?: string;
  fiatCashoutSubtitle?: string;
};

const RecipientHeader: React.FC<RecipientHeaderProps> = ({
  recipient_identifier,
  type,
  selectedContact,
  mode = 'send',
  tradeMode,
  assetSymbol,
  pricePreview,
  fiatCashout = false,
  fiatCashoutTitle = 'Withdraw',
  fiatCashoutSubtitle = 'Funds go to your selected debit card.',
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  const isTradeFlow = mode === 'trade';
  const isRequestFlow = type === 'request';

  const title = useMemo(() => {
    if (fiatCashout && isTradeFlow) {
      return fiatCashoutTitle;
    }
    if (isTradeFlow) {
      return tradeMode === 'sell' ? 'Selling' : 'Buying';
    }
    return isRequestFlow ? 'Requesting from' : 'Paying';
  }, [fiatCashout, fiatCashoutTitle, isTradeFlow, tradeMode, isRequestFlow]);

  const trailingLine1 = fiatCashout && isTradeFlow
    ? ''
    : isTradeFlow
      ? (assetSymbol || '').toUpperCase()
      : selectedContact?.nickname || '';

  const line2 =
    fiatCashout && isTradeFlow
      ? fiatCashoutSubtitle
      : isTradeFlow
        ? pricePreview || ''
        : recipient_identifier;

  return (
    <View style={styles.headerArea}>
      <View style={styles.titleRow}>
        <CustomText fontWeight="semiBold" size={18}>
          {title}
        </CustomText>
        {trailingLine1 ? (
          <CustomText fontWeight="semiBold" size={18}>
            {trailingLine1}
          </CustomText>
        ) : null}
      </View>
      <CustomText
        variant="caption"
        size={14}
        color={theme.colors.primary}
        style={styles.identifier}
      >
        {line2}
      </CustomText>
    </View>
  );
};

export default RecipientHeader;

