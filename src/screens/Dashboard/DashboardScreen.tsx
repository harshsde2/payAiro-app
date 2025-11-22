import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabParamList, DashboardStackParamList } from '@navigations/types';
import { NAVIGATION_SCREENS } from '@navigations/navigationConstants';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { setLogin } from '@redux/slices/authenticationSlice';
import { useTheme } from '@styles/ThemeContext';
import { dashboardStyles } from '@styles/screens/dashboard/dashboardStyles';
import CustomText from '@components/common-components/CustomText';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList, typeof NAVIGATION_SCREENS.DASHBOARD>,
  BottomTabNavigationProp<BottomTabParamList>
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = dashboardStyles(theme);
  const userData = useSelector((state: RootState) => state.authenticationSlice.userData);

  const navigateToTab = (tabName: keyof BottomTabParamList) => {
    navigation.getParent()?.navigate(tabName);
  };

  const handleLogout = () => {
    dispatch(setLogin(false));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <CustomText variant="h2">Dashboard</CustomText>
        <CustomText variant="body" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.sm }}>
          Welcome {userData?.name || 'User'}!
        </CustomText>
      </View>

      <View style={styles.balanceCard}>
        <CustomText variant="caption" style={{ marginBottom: theme.spacing.sm }}>
          PayAiro Balance
        </CustomText>
        <CustomText variant="h1" fontWeight="bold">
          $0.00
        </CustomText>
      </View>

      <View style={styles.quickActions}>
        <CustomText variant="h5" style={{ marginBottom: theme.spacing.base }}>
          Quick Actions
        </CustomText>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToTab(NAVIGATION_SCREENS.CRYPTO_TAB)}
        >
          <CustomText variant="body" color={theme.colors.primary} fontWeight="medium">
            Buy Crypto
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToTab(NAVIGATION_SCREENS.WALLET_TAB)}
        >
          <CustomText variant="body" color={theme.colors.primary} fontWeight="medium">
            Add Funds
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToTab(NAVIGATION_SCREENS.TRANSACTIONS_TAB)}
        >
          <CustomText variant="body" color={theme.colors.primary} fontWeight="medium">
            View Transactions
          </CustomText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <CustomText variant="body" color={theme.colors.error} fontWeight="medium">
          Logout
        </CustomText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;

