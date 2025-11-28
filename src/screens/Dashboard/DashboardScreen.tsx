import React, { useState, useLayoutEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
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
import ScreenWrapper from '@components/common-components/ScreenWrapper';
import { AppIcon } from '@assets/svgs';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { IContact, ICryptoAsset } from './types';
import { BlurView } from '@react-native-community/blur';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList, typeof NAVIGATION_SCREENS.DASHBOARD>,
  BottomTabNavigationProp<BottomTabParamList>
>;

const CONTACTS: IContact[] = [
  { id: 'add', name: 'Add Contact', isAddButton: true },
  { id: '1', name: 'Kevin', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Lyda', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '3', name: 'Marry', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: '4', name: 'Evelyn', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

const CRYPTO_ASSETS: ICryptoAsset[] = [
  {
    id: '1',
    name: 'Ethereum',
    symbol: 'ETH',
    amount: '0.25 ETH',
    value: '$825.84',
    change: '+0.75%',
    isPositive: true,
    icon: 'ethereum',
    iconBgColor: '#627EEA',
  },
  {
    id: '2',
    name: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.31 BTC',
    value: '$31603.10',
    change: '+0.42%',
    isPositive: true,
    icon: 'bitcoin',
    iconBgColor: '#F7931A',
  },
];

const BellIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
      stroke="#00793F"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AddBalanceIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke="white" strokeWidth={2} />
    <Path d="M12 8v8M8 12h8" stroke="white" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const SendIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReceiveIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={7} height={7} stroke="white" strokeWidth={2} />
    <Rect x={14} y={3} width={7} height={7} stroke="white" strokeWidth={2} />
    <Rect x={3} y={14} width={7} height={7} stroke="white" strokeWidth={2} />
    <Rect x={14} y={14} width={7} height={7} stroke="white" strokeWidth={2} />
  </Svg>
);

const WithdrawIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={6} width={20} height={14} rx={2} stroke="white" strokeWidth={2} />
    <Path d="M12 10v6M9 13h6" stroke="white" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const EthereumIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
    <Path d="M16 4l-8 12 8 5 8-5-8-12z" fill="white" opacity={0.8} />
    <Path d="M8 16l8 12 8-12-8 5-8-5z" fill="white" />
  </Svg>
);

const BitcoinIcon = () => (
  <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
    <Path
      d="M20 10h-4V8h-2v2h-2V8h-2v2h-2v2h2v8h-2v2h2v2h2v-2h2v2h2v-2h4c2 0 4-2 4-4 0-1.5-1-2.5-2-3 1-0.5 2-1.5 2-3 0-2-2-4-4-4zm0 10h-6v-4h6c1 0 2 1 2 2s-1 2-2 2zm0-6h-6v-4h6c1 0 2 1 2 2s-1 2-2 2z"
      fill="white"
    />
  </Svg>
);

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = dashboardStyles(theme);
  const userData = useSelector((state: RootState) => state.authenticationSlice.userData);
  const [showBalance, setShowBalance] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const navigateToTab = (tabName: keyof BottomTabParamList) => {
    navigation.getParent()?.navigate(tabName);
  };

  const handleLogout = () => {
    dispatch(setLogin(false));
  };

  const renderQuickAction = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.quickActionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionButton}>{icon}</View>
      <CustomText variant="bodySmall" fontFamily="inter" style={styles.quickActionLabel}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );

  const renderContact = (contact: IContact) => {
    if (contact.isAddButton) {
      return (
        <TouchableOpacity key={contact.id} style={styles.contactItem} activeOpacity={0.7}>
          <View style={styles.addContactButton}>
            <CustomText style={styles.addContactIcon}>+</CustomText>
          </View>
          <CustomText variant="bodySmall" fontFamily="inter" numberOfLines={1}>
            {contact.name}
          </CustomText>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={contact.id} style={styles.contactItem} activeOpacity={0.7}>
        <View style={styles.contactImageContainer}>
          <Image
            source={{ uri: contact.image }}
            style={styles.contactImage}
            resizeMode="cover"
          />
        </View>
        <CustomText variant="bodySmall" fontFamily="inter" numberOfLines={1}>
          {contact.name}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderCryptoCard = (crypto: ICryptoAsset) => (
    <TouchableOpacity
      key={crypto.id}
      style={styles.cryptoCard}
      activeOpacity={0.7}
      onPress={() => navigateToTab(NAVIGATION_SCREENS.CRYPTO_TAB)}
    >
      <View style={[styles.cryptoIconContainer, { backgroundColor: crypto.iconBgColor }]}>
        {crypto.icon === 'ethereum' ? <EthereumIcon /> : <BitcoinIcon />}
      </View>
      <View style={styles.cryptoInfo}>
        <CustomText variant="body" fontWeight="semiBold" fontFamily="inter">
          {crypto.name}
        </CustomText>
        <CustomText variant="bodySmall" color={theme.colors.greyDark} fontFamily="inter">
          {crypto.amount}
        </CustomText>
      </View>
      <View style={styles.cryptoValues}>
        <CustomText variant="body" fontWeight="semiBold" fontFamily="inter">
          {crypto.value}
        </CustomText>
        <CustomText
          variant="bodySmall"
          fontFamily="inter"
          style={crypto.isPositive ? styles.positiveChange : styles.negativeChange}
        >
          {crypto.change}
        </CustomText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['top']}
      scrollable
      contentStyle={styles.scrollContent}
      gradient="linear"
      gradientColors={[
        theme.colors.greenLight2,
        theme.colors.greenLight2,
        theme.colors.white,
        theme.colors.greenLight2,
        theme.colors.greenLight1,
        theme.colors.tertiary,
        theme.colors.greenLight1,
        theme.colors.greenLight2,
        theme.colors.white,
      ]}
      gradientStart={{ x: 1, y: 1 }}
      gradientEnd={{ x: 0, y: 0 }}
    >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.welcomeContainer}>
              <CustomText variant="bodySmall" color={theme.colors.greyDark} fontFamily="inter">
                Welcome,
              </CustomText>
              <CustomText variant="h5" fontWeight="semiBold">
                {userData?.name || 'Ananda Faris!'}
              </CustomText>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <BellIcon />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCardContainer}>
          <View style={styles.balanceCardWrapper}>
            <BlurView
              style={styles.blurView}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.balanceCardContent}>
              <View style={styles.balanceTitleRow}>
                <CustomText
                  variant="body"
                  color={theme.colors.greyDark}
                  fontFamily="inter"
                  style={styles.balanceTitle}
                >
                  PayAiro Balance
                </CustomText>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                  {showBalance ? (
                    <AppIcon.EyeOn width={18} height={18} color={theme.colors.greyDark} />
                  ) : (
                    <AppIcon.EyeOff width={18} height={18} color={theme.colors.greyDark} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.balanceAmountRow}>
                <Text style={[styles.currencySymbol, { color: theme.colors.black }]}>$</Text>
                <CustomText style={styles.balanceAmount}>
                  {showBalance ? '1299' : '****'}
                </CustomText>
                <CustomText style={styles.balanceDecimal}>
                  {showBalance ? '.22' : '.**'}
                </CustomText>
                <TouchableOpacity style={{ marginLeft: theme.spacing.xs, marginTop: 8 }}>
                  <AppIcon.ChevronDown width={16} height={16} color={theme.colors.black} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.accountDetailsLink}>
                <CustomText
                  variant="body"
                  color={theme.colors.primary}
                  fontFamily="inter"
                  fontWeight="medium"
                  style={{ textDecorationLine: 'underline' }}
                >
                  Account Details
                </CustomText>
              </TouchableOpacity>

              {/* Quick Actions */}
              <View style={styles.quickActionsRow}>
                {renderQuickAction(<AddBalanceIcon />, 'Add Balance', () =>
                  navigateToTab(NAVIGATION_SCREENS.WALLET_TAB)
                )}
                {renderQuickAction(<SendIcon />, 'Send', () => {})}
                {renderQuickAction(<ReceiveIcon />, 'Receive', () => {})}
                {renderQuickAction(<WithdrawIcon />, 'Withdraw', () => {})}
              </View>
            </View>
          </View>
        </View>

        {/* Contacts & Crypto Section */}
        <View style={styles.sectionContainer}>
          {/* Contacts Section */}
          <View style={styles.sectionHeader}>
            <CustomText variant="h5" fontWeight="semiBold">
              Contacts
            </CustomText>
            <TouchableOpacity>
              <CustomText variant="body" style={styles.seeAllText} fontFamily="inter">
                See all
              </CustomText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contactsScrollView}
          >
            {CONTACTS.map(renderContact)}
          </ScrollView>

          {/* Crypto Section */}
          <View style={styles.cryptoSection}>
            <View style={styles.sectionHeader}>
              <CustomText variant="h5" fontWeight="semiBold">
                Crypto
              </CustomText>
              <TouchableOpacity onPress={() => navigateToTab(NAVIGATION_SCREENS.CRYPTO_TAB)}>
                <CustomText variant="body" style={styles.seeAllText} fontFamily="inter">
                  See all
                </CustomText>
              </TouchableOpacity>
            </View>

            {CRYPTO_ASSETS.map(renderCryptoCard)}
          </View>
        </View>
    </ScreenWrapper>
  );
};

export default DashboardScreen;
