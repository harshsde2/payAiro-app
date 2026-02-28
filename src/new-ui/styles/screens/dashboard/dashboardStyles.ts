import { StyleSheet, Dimensions } from 'react-native';
import { ITheme } from '../../themes/themeTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const dashboardStyles = (theme: ITheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing['3xl'],
    },
    
    // Header Section
    headerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: theme.spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: theme.spacing.sm,
    },
    welcomeContainer: {
      justifyContent: 'center',
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    
    // Balance Card Section
    balanceCardContainer: {
      marginHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.xl,
    },
    balanceCardWrapper: {
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
    },
    balanceCardContent: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    balanceTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    balanceTitle: {
      marginRight: theme.spacing.xs,
    },
    balanceAmountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.sm,
    },
    currencySymbol: {
      fontSize: 32,
      fontWeight: '600',
      marginRight: 4,
    },
    balanceAmount: {
      fontSize: 40,
      fontWeight: '700',
      letterSpacing: -1,
    },
    balanceDecimal: {
      fontSize: 24,
      fontWeight: '500',
      color: theme.colors.greyDark,
      marginLeft: 2,
    },
    accountDetailsLink: {
      marginBottom: theme.spacing.xl,
    },
    
    // Quick Actions
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: theme.spacing.sm,
    },
    quickActionItem: {
      alignItems: 'center',
    },
    quickActionButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    quickActionLabel: {
      textAlign: 'center',
    },
    
    // Contacts Section
    sectionContainer: {
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.base,
      marginTop: theme.spacing.sm,
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.base,
    },
    seeAllText: {
      color: theme.colors.greyDark,
    },
    contactsScrollView: {
      paddingLeft: theme.spacing.base,
    },
    contactItem: {
      alignItems: 'center',
      marginRight: theme.spacing.base,
      width: 70,
    },
    contactImageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: theme.spacing.xs,
      overflow: 'hidden',
    },
    contactImage: {
      width: '100%',
      height: '100%',
    },
    addContactButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    addContactIcon: {
      fontSize: 28,
      color: theme.colors.primary,
      fontWeight: '300',
    },
    
    // Crypto Section
    cryptoSection: {
      paddingHorizontal: theme.spacing.base,
      marginTop: theme.spacing.xl,
    },
    cryptoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    cryptoIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    cryptoInfo: {
      flex: 1,
    },
    cryptoValues: {
      alignItems: 'flex-end',
    },
    positiveChange: {
      color: theme.colors.secondary,
    },
    negativeChange: {
      color: theme.colors.error,
    },
    
    // Logout button (keeping for compatibility)
    logoutButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.base,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.xl,
      marginHorizontal: theme.spacing.base,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
  });
};
