import { StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

export const enterAmountStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: 'red',
    },
    keyboardAvoiding: {
      flex: 1,
      // backgroundColor: 'blue',
    },
    header: {
      width: '100%',
      paddingVertical: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor: 'blue',
    },
    headerRightSpacer: {
      width: 30,
    },
    headerArea: {
      alignItems: 'center',
      marginTop: theme.spacing['3xl'],
      paddingHorizontal: theme.spacing.base,
      flexGrow: 0,
      // backgroundColor: 'blue',
    },
    title: {
      marginBottom: theme.spacing.xs,
    },
    identifier: {
      marginBottom: theme.spacing['3xl'],
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      width: '100%',
    },
    amountCurrency: {
      marginRight: 4,
    },
    amountSuffix: {
      marginLeft: 6,
      color: theme.colors.greyDark,
    },
    amountInteger: {
      fontSize: 40,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    amountFraction: {
      fontSize: 32,
      opacity: 0.5,
      marginLeft: 2,
    },
    amountInput: {
      padding: 0,
      margin: 0,
      minWidth: 10,
    },
    inputWrapper: {
      marginTop: theme.spacing['3xl'],
      width: '100%',
    },
    bottomArea: {
      // flexDirection: 'row',
      // flex:1,
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.base,
    },
    /** Trade: full-width payment row, then pay control — avoids cramped side-by-side layout. */
    bottomAreaTrade: {
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.base,
      width: '100%',
      gap: theme.spacing.md,
    },
    bottomTradePayRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '100%',
    },
    bottomPaymentSlotFiat: {
      width: '100%',
      marginRight: theme.spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.base,
    },
    requestButton: {
      flex: 1,
      backgroundColor: theme.colors.black,
    },
    payButton: {
      width: '100%',
      minHeight: 52,
      alignSelf: 'stretch',
    },
    requestButton: {
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },

    fundingCard: {
      // marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.white ?? theme.colors.background,
    },
    fundingCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fundingCardLeft: {
      flex: 1,
      marginRight: theme.spacing.base,
      flexDirection: 'row',
      alignItems: 'center',
    },
    fundingCardPayairoIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
    },
    fundingCardTextContainer: {
      flex: 1,
    },
    fundingCardName: {
      flexShrink: 1,
    },
    fundingCardMasked: {
      marginTop: 4,
    },
    fundingCardChevron: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkBalanceText: {
      marginTop: theme.spacing.xs,
    },

    selectorContainer: {
      flex: 1,
    },
    selectorTitle: {
      marginBottom: theme.spacing.md,
    },
    selectorListContent: {
      paddingBottom: theme.spacing.xl,
    },
    selectorScrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    selectorSeparator: {
      height: theme.spacing.xs,
    },
    selectorItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 16,
      backgroundColor: theme.colors.white ?? theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    selectorItemSelected: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    selectorItemTitle: {
      flexShrink: 1,
    },
    selectorItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectorItemTextContainer: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    selectorItemPayairoIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    selectorItemMasked: {
      marginTop: 4,
    },
    cryptoSectionContainer: {
      marginTop: theme.spacing.md,
    },
    cryptoSectionTitle: {
      marginBottom: theme.spacing.md,
    },
    cryptoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.lg,
      gap: theme.spacing.base,
    },
    cryptoIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cryptoIconImage: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
    cryptoInfoSection: {
      flex: 1,
    },
    cryptoAssetName: {
      marginBottom: 2,
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.sm,
    },
    cryptoQuantityText: {
      color: theme.colors.greyDark,
      fontFamily: theme.typography.fontFamily.interMedium,
      fontWeight: theme.typography.fontWeight.medium,
      fontSize: theme.typography.fontSize.xxs,
    },
    cryptoValueSection: {
      alignItems: 'flex-end',
    },
    cryptoUsdValue: {
      marginBottom: 2,
    },
    cryptoPendingText: {
      color: theme.colors.secondary,
    },
    cryptoModeContainer: {
      marginTop: theme.spacing.sm,
      alignItems: 'center',
    },
    cryptoToggleButton: {
      minWidth: 76,
      height: 36,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.white,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    cryptoToggleIcon: {
      color: theme.colors.primary,
      fontSize: 16,
    },
    cryptoToggleText: {
      color: theme.colors.primary,
      fontSize: 18,
    },
    cryptoFeeText: {
      marginTop: theme.spacing.xs,
      color: theme.colors.greyDark,
    },
    cryptoMaxContainer: {
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.white,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
    },
    cryptoMaxText: {
      color: theme.colors.text,
    },
    cryptoEquivalentText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.greyDark,
    },

    // Crypto receipt modal
    cryptoReceiptBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    cryptoReceiptSheet: {
      width: '100%',
      padding: 18,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    cryptoReceiptTitle: {
      marginBottom: 14,
      textAlign: 'left',
    },
    cryptoReceiptRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    cryptoReceiptRowTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    cryptoReceiptLabel: {
      opacity: 0.8,
    },
    cryptoReceiptTotal: {
      fontWeight: '600',
    },
    cryptoReceiptButtonArea: {
      marginVertical: 20,
      gap: 12,
    },
    cryptoReceiptCancelButton: {
      height: 46,
      backgroundColor: 'black',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cashBuyBlock: {
      width: '100%',
      paddingHorizontal: theme.spacing.base,
      marginTop: theme.spacing.md,
      gap: theme.spacing.md,
    },
    cashBuySummaryCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
    },
    cashBuySummaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    cashBuySummarySub: {
      marginTop: 4,
    },
    cashBuySummaryDetail: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    cashBuySummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    cashBuyRetailNote: {
      marginTop: theme.spacing.sm,
      lineHeight: 18,
    },
  });

