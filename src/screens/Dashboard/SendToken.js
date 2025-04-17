import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Platform, StatusBar } from 'react-native';
import Fonts from '../../constants/Fonts';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {
  SVGLeftArrow,
  SVGLocation,
  SVGSearch,
  SVGUSD,
  SVGDownArrow3,
} from '../../constants/images';
import { SvgXml } from 'react-native-svg';
import GenericButton from '../../components/GenericButton';
import TextInputField from '../../components/TextInputField';
import { useNavigation, useFocusEffect, useIsFocused, CommonActions } from '@react-navigation/native';
import useSelectorAction from '../../hooks/useSelectorAction';
import SelectionModal from '../../components/SelectionModal';
import useDispatchAction from '../../hooks/useDispatchAction';
import { setErrorMsg } from '../../redux/slices/authenticationSlice';
import PincodeScreen from '../Authentications/PincodeScreen';
import { getPin } from '../../services/Auth';
import { useTheme } from '../../styles/ThemeContext';
import { ScreenContainer } from 'HOC';

/**
 * SendToken Screen Component
 * Handles sending or receiving tokens to/from other users
 */
export default function SendToken(props) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isFocused = useIsFocused();
  const isNavigatingRef = useRef(false);
  
  const { 
    selectedCrypto, 
    bankBalance, 
    networkLists, 
    tokens, 
    bankLists 
  } = useSelectorAction();
  
  // Extract route params
  const { sender, type } = props.route.params;
  
  // Component state
  const [address, setAddress] = useState(sender ?? '');
  const [pinVisible, setPinVisible] = useState(false);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [isScreenMounted, setIsScreenMounted] = useState(false);
  
  // Get background color from theme
  const backgroundColor = theme.colors.palette.green50;
  
  // Memoized styles to prevent recreation on each render
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Memoized selected account to prevent unnecessary calculations
  const [selectedAccount, setSelectedAccount] = useState(
    bankLists?.filter(i => i?.account_type !== undefined)[0] ?? null,
  );
  
  // Determine cryptocurrency symbol from image
  const symbol = useMemo(() => {
    if (selectedCrypto?.image?.includes('btc')) return 'BTC';
    if (selectedCrypto?.image?.includes('eth')) return 'ETH';
    if (selectedCrypto?.image?.includes('matic')) return 'MATIC';
    return 'XRP';
  }, [selectedCrypto]);
  
  // Calculate balance in USDT (memoized)
  const balanceAssetsUSDT = useMemo(() => {
    return (
      Number(networkLists[0]?.balance_in_tether || 0) +
      Number(networkLists[1]?.balance_in_tether || 0) +
      Number(networkLists[2]?.balance_in_tether || 0) +
      Number(networkLists[3]?.balance_in_tether || 0)
    ).toFixed(3);
  }, [networkLists]);
  
  // Set screen mounted state and ensure status bar is consistent
  useEffect(() => {
    setIsScreenMounted(true);
    
    // Set status bar background color to match screen
    StatusBar.setBackgroundColor(backgroundColor);
    StatusBar.setBarStyle('dark-content');
    
    return () => {
      setIsScreenMounted(false);
    };
  }, [backgroundColor]);
  
  // Handle hardware back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Prevent default back action
          if (pinVisible) {
            setPinVisible(false);
            return true;
          }
          
          // Use navigation.goBack() with cleanup
          if (navigation.canGoBack() && !isNavigatingRef.current) {
            handleGoBack();
            return true;
          }
          
          return false;
        }
      );

      return () => backHandler.remove();
    }, [navigation, pinVisible, handleGoBack])
  );
  
  /**
   * Handles navigation back action with cleanup
   */
  const handleGoBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    
    // Set navigating flag to prevent multiple calls
    isNavigatingRef.current = true;
    
    // Clear states before navigating back
    setSelectionModalVisible(false);
    setPinVisible(false);
    
    // Use CommonActions for more reliable navigation
    navigation.dispatch(CommonActions.goBack());
    
    // Reset flag after a delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, [navigation]);
  
  /**
   * Handles the crypto transaction
   */
  const handleCrypto = useCallback(async () => {
    if (!address.trim()) {
      useDispatchAction(setErrorMsg('Amount & Address are required'));
      return;
    }
    
    navigation.navigate('ScanPay', {
      bank: selectedAccount,
      sender: address,
      type: 'crypto',
    });
  }, [address, navigation, selectedAccount]);
  
  /**
   * Handles PIN verification and proceeds with transaction
   */
  const handlePinVerification = useCallback(async (pin) => {
    if (pin.length === 4) {
      const savedPin = await getPin();
      if (pin === savedPin) {
        setPinVisible(false);
        handleCrypto();
      } else {
        useDispatchAction(
          setErrorMsg('Please enter correct pin to proceed for payment')
        );
      }
    } else {
      useDispatchAction(
        setErrorMsg('Please enter correct pin to proceed for payment')
      );
    }
  }, [handleCrypto]);
  
  /**
   * Renders the account selection component
   */
  const renderAccountSelection = () => (
    <TouchableOpacity
      onPress={() => setSelectionModalVisible(true)}
      style={styles.accountSelector}>
      <View style={styles.accountInfo}>
        <SvgXml xml={SVGUSD} width={40} height={40} />
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>
            {selectedAccount?.bank_name ?? selectedAccount?.name} (
            {selectedAccount?.account_type ?? 'External'})
          </Text>
          <Text numberOfLines={1} style={styles.accountBalance}>
            {getAccountBalance()}
          </Text>
        </View>
      </View>
      <SvgXml xml={SVGDownArrow3} />
    </TouchableOpacity>
  );
  
  /**
   * Gets the account balance based on account type
   */
  const getAccountBalance = useCallback(() => {
    if (selectedAccount?.balances?.available) {
      return selectedAccount.balances.available;
    }
    
    switch (selectedAccount?.account_type) {
      case 'rothIra':
        return bankBalance?.roth_ira_account?.usd;
      case 'traditionalIra':
        return bankBalance?.traditional_ira_account?.usd;
      default:
        return bankBalance?.bank_account?.usd;
    }
  }, [selectedAccount, bankBalance]);
  
  const renderScreenContent = () => (
    <>
      <StatusBar
        translucent={false}
        backgroundColor={backgroundColor}
        barStyle="dark-content"
      />
      <SelectionModal
        isVisible={selectionModalVisible}
        data={bankLists?.filter(i => i?.account_type !== undefined) ?? []}
        onClose={() => setSelectionModalVisible(false)}
        onSelected={setSelectedAccount}
      />
      
      <HeaderTitle2
        title={`${type === 'receive' ? 'Receive' : 'Send'} Token`}
        leftIcon={SVGLeftArrow}
        rightIcon={SVGSearch}
        onPressLeft={handleGoBack}
      />

      <View style={styles.container}>
        <Text style={styles.label}>From</Text>
        {renderAccountSelection()}

        <TextInputField
          editable={sender === '' || sender === undefined}
          label={'To'}
          placeholder={'Name,$Airtag,Phone,Email'}
          isIcon={SVGLocation}
          icon={SVGLocation}
          iStyle={styles.inputIcon}
          cStyle={styles.inputContainer}
          value={address}
          onChange={setAddress}
        />

        <GenericButton
          title={type === 'receive' ? 'Receive' : 'Send'}
          cStyle={styles.actionButton}
          onPress={() => setPinVisible(true)}
        />
      </View>
    </>
  );
  
  // If pin is visible, only show the PincodeScreen
  if (pinVisible) {
    return (
      <ScreenContainer 
        backgroundColor={backgroundColor}
        padding={0}
        scrollable={false}
        safeArea={false}
        statusBarColor={backgroundColor}
      >
        <StatusBar
          translucent={false}
          backgroundColor={backgroundColor}
          barStyle="dark-content"
        />
        <PincodeScreen onPress={handlePinVerification} />
      </ScreenContainer>
    );
  }
  
  return (
    <View style={[styles.rootContainer, {backgroundColor}]}>
      <ScreenContainer 
        backgroundColor={backgroundColor}
        padding={0}
        scrollable={false}
        safeArea={false}
        statusBarColor={backgroundColor}
      >
        {renderScreenContent()}
      </ScreenContainer>
    </View>
  );
}

/**
 * Styles creator function using theme variables
 */
const createStyles = (theme) => StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderTopEndRadius: theme.spacing.spacing.xxl,
    borderTopStartRadius: theme.spacing.spacing.xxl,
    padding: theme.spacing.layout.screenPadding,
    marginTop: theme.spacing.spacing.lg,
  },
  label: {
    fontFamily: Fonts.semibold,
    color: theme.colors.text.primary,
    padding: theme.spacing.spacing.sm,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.palette.grey50,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.spacing.spacing.sm,
    padding: theme.spacing.spacing.sm,
    margin: theme.spacing.spacing.xs,
    marginBottom: theme.spacing.spacing.sm,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  accountDetails: {
    marginHorizontal: theme.spacing.spacing.sm,
    width: '70%',
  },
  accountName: {
    fontFamily: Fonts.semibold,
    textTransform: 'capitalize',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  accountBalance: {
    fontFamily: Fonts.semibold,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
  },
  inputIcon: {
    backgroundColor: theme.colors.palette.grey100,
    paddingLeft: theme.spacing.spacing.sm,
    borderRadius: theme.spacing.spacing.sm,
    paddingVertical: theme.spacing.spacing.xs,
  },
  inputContainer: {
    marginTop: theme.spacing.spacing.md,
    borderRadius: theme.spacing.spacing.sm,
  },
  actionButton: {
    marginTop: theme.spacing.spacing.xxxl * 4.8, // Approximating the original 307
  },
});
