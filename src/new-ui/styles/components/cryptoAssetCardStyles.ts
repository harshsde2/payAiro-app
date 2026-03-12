import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const cryptoAssetCardStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.radius.lg,

      ...theme.shadows.sm,
      gap: theme.spacing.base,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconImage: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
    infoSection: {
      flex: 1,
    },
    assetName: {
      marginBottom: 2,
      fontFamily: theme.typography.fontFamily.interSemiBold,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.sm,
    },
    quantityText: {
      color: theme.colors.greyDark,
      fontFamily: theme.typography.fontFamily.interMedium,
      fontWeight: theme.typography.fontWeight.medium,
      fontSize: theme.typography.fontSize.xxs,
    },
    valueSection: {
      alignItems: 'flex-end',
    },
    usdValue: {
      marginBottom: 2,
    },
    availableText: {
      color: theme.colors.secondary,
    },
  });
