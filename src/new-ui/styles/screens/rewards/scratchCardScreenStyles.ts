import { Dimensions, StyleSheet } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = SCREEN_WIDTH - 64;

export const SCRATCH_CARD_SIZE = CARD_SIZE;

export const scratchCardScreenStyles = (theme: ITheme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    subtitle: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    cardWrapper: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: theme.spacing.lg,
    },
    underlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.greenLight2,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
    },
    overlayCanvas: {
      ...StyleSheet.absoluteFillObject,
    },
    giftOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.xl,
    },
    giftEmoji: {
      fontSize: 60,
      marginBottom: theme.spacing.sm,
    },
    giftText: {
      color: theme.colors.white,
      fontSize: 18,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center',
    },
    revealedEmoji: {
      fontSize: 48,
      marginBottom: theme.spacing.sm,
    },
    revealedTitle: {
      fontSize: 22,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    revealedDescription: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    claimButton: {
      borderRadius: 30,
      height: 54,
      width: '100%',
    },
    claimedContainer: {
      alignItems: 'center',
      width: '100%',
    },
    brandCard: {
      width: '100%',
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.greenLight2,
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    brandLogoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    brandDiscount: {
      fontSize: 28,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    brandDescription: {
      fontSize: 14,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    codeFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.full,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.white,
      width: '100%',
    },
    codeText: {
      flex: 1,
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    redeemButton: {
      borderRadius: 30,
      height: 54,
      width: '100%',
    },
  });
