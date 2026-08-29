import { StyleSheet } from "react-native";
import { ITheme } from "../themes/themeTypes";

const dashboardBalanceCardStyles = (theme: ITheme) => StyleSheet.create({
  contentContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme.colors.glassTint,
    width: '100%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.interSemiBold,
  },
  eyeIconButton: {
    padding: 2,
    marginLeft: 6,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.interRegular,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: theme.spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    minHeight: 44,
  },
  currencySymbol: {
    fontFamily: theme.typography.fontFamily.interBold,
    marginRight: 2,
    fontWeight: 'bold',
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
    maxWidth: '70%',
  },
  balanceInteger: {
    fontFamily: theme.typography.fontFamily.interBold,
    fontWeight: 'bold',
  },
  balanceDecimal: {
    fontFamily: theme.typography.fontFamily.interMedium,
    marginLeft: 1,
    fontWeight: 'bold',
    },
  chevronWrapper: {
    marginLeft: 4,
    alignSelf: 'center',
  },
  accountDetailsLink: {
    marginTop: theme.spacing.xs,
  },
  accountDetailsText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.interMedium,
    textDecorationLine: 'underline',
  },
  footerContainer: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.base,
  },
  glassyWrapper: {
    width: '100%',
    height: '100%',
    padding: theme.spacing.md,
  },
  container: {
    width: '90%',
    borderRadius: theme.radius.xl,
    height: 240,
  },
  containerNoActions: {
    height: 105,
  },
});

export default dashboardBalanceCardStyles;