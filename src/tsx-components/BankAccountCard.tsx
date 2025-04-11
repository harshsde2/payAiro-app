import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface BankAccountCardProps {
  bankName: string;
  bankAddress?: string;
  accountNumber: string;
  balance: number | string;
  accountType?: string;
  onViewDetails: () => void;
  icon: string;
}

const BankAccountCard: React.FC<BankAccountCardProps> = ({
  bankName,
  bankAddress,
  accountNumber,
  balance,
  accountType = 'Personal',
  onViewDetails,
  icon
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Format balance if it's a number
  const formattedBalance = typeof balance === 'number' ? 
    `$${balance.toFixed(2)}` : 
    (balance.startsWith('$') ? balance : `$${balance}`);

  // Format account number to show only last 4 digits
  const formattedAccountNumber = accountNumber.length > 4 ? 
    `••••${accountNumber.slice(-4)}` : 
    accountNumber;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.bankInfoContainer}>
          <SvgXml xml={icon} width={25} height={25} />
          <View style={styles.bankDetails}>
            <View style={styles.bankNameContainer}>
              <CustomText 
                variant="subtitle2" 
                fontWeight="semiBold" 
                style={styles.bankName}
              >
                {bankName}
              </CustomText>
              <CustomText 
                variant="caption" 
                color={theme.colors.palette.green700}
                style={styles.accountType}
              >
                ({accountType})
              </CustomText>
            </View>
            
            {bankAddress && (
              <CustomText 
                variant="caption" 
                color={theme.colors.text.secondary}
                style={styles.bankAddress}
                numberOfLines={1}
              >
                {bankAddress}
              </CustomText>
            )}
          </View>
        </View>
      </View>
      
      <CustomText 
        variant="caption" 
        fontWeight="bold" 
        color={theme.colors.text.primary}
        style={styles.accountNumber}
      >
        Account No: {formattedAccountNumber}
      </CustomText>
      
      <View style={styles.footer}>
        <CustomText 
          variant="subtitle2" 
          fontWeight="bold" 
          color={theme.colors.palette.green700}
          style={styles.balance}
        >
          {formattedBalance}
        </CustomText>
        
        <TouchableOpacity onPress={onViewDetails}>
          <CustomText 
            variant="caption" 
            color={theme.colors.text.secondary}
            style={styles.viewDetails}
          >
            View Details
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.palette.grey100,
    padding: theme.spacing.spacing.sm,
    width: 200,
    borderRadius: 15,
    marginRight: theme.spacing.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.spacing.xxs,
  },
  bankInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  bankDetails: {
    marginLeft: theme.spacing.spacing.xs,
  },
  bankNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 16,
  },
  accountType: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginLeft: theme.spacing.spacing.xxs,
  },
  bankAddress: {
    fontSize: 10,
    marginTop: 2,
  },
  accountNumber: {
    fontSize: 10,
    marginTop: theme.spacing.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.spacing.xs,
  },
  balance: {
    fontSize: 16,
    width: '60%',
  },
  viewDetails: {
    fontSize: 10,
    textDecorationLine: 'underline',
  }
});

export default memo(BankAccountCard); 