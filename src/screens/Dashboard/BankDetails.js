import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// Components
import { ScreenContainer } from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import WalletCard from '../../components/WalletCard';
import CustomText from '../../tsx-components/CustomText';

// Constants & Styles
import {
  SVGBankCard,
  SVGCCard,
  SVGCard3,
  SVGLeftArrow,
  SVGLoan,
  SVGSlider,
} from '../../constants/images';
import { FINANCE_LISTS } from '../../constants/constant';
import { useTheme } from '../../styles/ThemeContext';

const BankDetails = props => {
  const { item, bankbalance } = props.route.params;
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Cannot go back, no screens in history');
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log('Navigation error:', err);
    }
  }, [navigation]);
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  // Handle finance item press
  const handleFinanceItemPress = useCallback((route, params = {}) => {
    if (route) {
      navigation.navigate(route, {
        requested: false,
        ...params,
      });
    }
  }, [navigation]);

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <KeyboardAvoidingView
        style={styles(theme).container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles(theme).scrollContent}>
          <HeaderTitle 
            title="Finance"
            leftIcon={SVGLeftArrow} 
            isBack={true}
            onPressLeft={handleGoBack}
          />
          
          <WalletCard data={item} bankbalance={bankbalance} />

          <SvgXml
            xml={SVGSlider}
            style={styles(theme).sliderIcon}
          />
          
          <View style={styles(theme).financeContainer}>
            <ScrollView>
              <View style={styles(theme).financeItemsContainer}>
                {FINANCE_LISTS.map((financeItem, index) => (
                  <TouchableOpacity
                    key={`finance-item-${index}`}
                    onPress={() => handleFinanceItemPress(financeItem.route)}
                    style={styles(theme).financeItemWrapper}>
                    <View style={styles(theme).financeIconContainer}>
                      <SvgXml xml={financeItem?.icon} style={styles(theme).financeIcon} />
                    </View>
                    <CustomText
                      variant="body2"
                      color={theme.colors.text.secondary}
                      style={styles(theme).financeItemText}>
                      {financeItem.name}
                    </CustomText>
                  </TouchableOpacity>
                ))}
                {/* Add invisible placeholders to maintain grid in last row */}
                {FINANCE_LISTS.length % 3 === 1 && (
                  <>
                    <View style={[styles(theme).financeItemWrapper, styles(theme).emptyItem]} />
                    <View style={[styles(theme).financeItemWrapper, styles(theme).emptyItem]} />
                  </>
                )}
                {FINANCE_LISTS.length % 3 === 2 && (
                  <View style={[styles(theme).financeItemWrapper, styles(theme).emptyItem]} />
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sliderIcon: {
    alignSelf: 'center', 
    margin: theme.spacing.spacing.md,
  },
  financeContainer: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: theme.spacing.layout.screenPadding,
    height: 400,
  },
  financeItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  financeItemWrapper: {
    width: '31%',
    marginBottom: theme.spacing.spacing.md,
  },
  financeIconContainer: {
    backgroundColor: theme.colors.palette.green100 + '33', // 20% opacity
    borderRadius: 20,
    padding: theme.spacing.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.palette.green100,
  },
  financeIcon: {
    alignSelf: 'center',
  },
  financeItemText: {
    textAlign: 'center',
    marginTop: theme.spacing.spacing.xs,
  },
  emptyItem: {
    opacity: 0,
    height: 0,
  },
});

export default BankDetails;
