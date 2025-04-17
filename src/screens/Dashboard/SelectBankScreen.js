import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// Components
import { ScreenContainer } from '../../HOC';
import HeaderTitle from '../../components/HeaderTitle';
import CustomText from '../../tsx-components/CustomText';

// Constants & Styles
import { SVGBank1, SVGBank2, SVGLeftArrow, SVGUSD } from '../../constants/images';
import { useTheme } from '../../styles/ThemeContext';

export default function SelectBankScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Bank list data
  const VBANK_LISTS = ['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'INDUS Bank'];
  
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
  
  // Handle bank selection
  const handleBankSelect = useCallback((bank) => {
    // Implementation for bank selection
    console.log('Selected bank:', bank);
    // Navigate or perform action based on selection
  }, []);
  
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <HeaderTitle 
        title="Select Bank" 
        leftIcon={SVGLeftArrow} 
        isBack={true}
        onPressLeft={handleGoBack}
      />
      
      <View style={styles(theme).container}>
        <CustomText
          variant={'h4'}
          fontWeight={'bold'}
          color={theme.colors.text.primary}
          style={styles(theme).sectionTitle}>
          Select Your Bank
        </CustomText>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles(theme).bankListContainer}>
            {VBANK_LISTS.map((bank, index) => (
              <TouchableOpacity
                key={`bank-${index}`}
                style={styles(theme).bankItem}
                onPress={() => handleBankSelect(bank)}>
                <SvgXml xml={SVGUSD} />
                <CustomText
                  variant="body2"
                  color={theme.colors.text.primary}
                  style={styles(theme).bankName}>
                  {bank}
                </CustomText>
              </TouchableOpacity>
            ))}
            
            {/* Add invisible placeholders for grid alignment if needed */}
            {VBANK_LISTS.length % 2 === 1 && (
              <View style={[styles(theme).bankItem, styles(theme).emptyItem]} />
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: theme.spacing.layout.screenPadding,
    marginTop: theme.spacing.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.spacing.sm,
  },
  bankListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: theme.spacing.spacing.sm,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.palette.grey100,
    borderRadius: 20,
    padding: theme.spacing.spacing.md,
    width: '48%',
    marginBottom: theme.spacing.spacing.md,
  },
  bankName: {
    marginLeft: theme.spacing.spacing.sm,
  },
  emptyItem: {
    opacity: 0,
  }
});
