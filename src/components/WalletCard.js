import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Fonts from '../constants/Fonts';
import {useNavigation} from '@react-navigation/native';

const WalletCard = ({data, bankbalance}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.card}>
      <Text style={styles.walletText}>Wallet Account</Text>
      <Text style={styles.bankOverview}>Bank overview</Text>
      <Text style={styles.balance}>${bankbalance}</Text>

      <View style={styles.separator} />

      <View style={styles.options}>
        <TouchableOpacity onPress={() => navigation.navigate('Statement')}>
          <Text style={styles.optionText}>Statement</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.optionText}>Debit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.optionText}>Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2F613F', // Dark green
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
  },
  walletText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: Fonts.regular,
  },
  bankOverview: {
    color: 'white',
    fontSize: 16,
    fontFamily: Fonts.semibold,
    alignSelf: 'center',
    textAlign: 'center',
  },
  balance: {
    color: 'white',
    fontSize: 36,
    fontFamily: Fonts.bold,
    marginVertical: 10,
    textAlign: 'center',
  },
  decimal: {
    fontSize: 20,
    fontFamily: Fonts.regular,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 10,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: {
    color: 'white',
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
});

export default WalletCard;
