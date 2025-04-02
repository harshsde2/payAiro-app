import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Fonts from '../constants/Fonts';
import useSelectorAction from '../hooks/useSelectorAction';
import {SvgXml} from 'react-native-svg';
import {
  SVGCanceled,
  SVGInfo,
  SVGReceive,
  SVGReceived,
  SVGRequested,
  SVGSent,
} from '../constants/images';
import moment from 'moment';
import GenericButton from './GenericButton';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/SCREENS';

const TransactionList = ({items = [], isVisble3}) => {
  const {walletData} = useSelectorAction();
  const navigation = useNavigation();
  console.log(items, 'items');
  const renderItem = ({item}) => {
    if (item?.data?.content) {
      return (
        <View
          style={[
            {
              padding: 10,
              marginVertical: 8,
              backgroundColor:
                item?.data?.sender__email === walletData?.account_email
                  ? 'rgba(247, 247, 247, 1)'
                  : 'rgba(209, 235, 211, 1)',
              borderWidth: 0,
              borderRadius: 10,
              alignSelf:
                item?.data?.sender__email === walletData?.account_email
                  ? 'flex-start'
                  : 'flex-end',
              // minWidth: '30%',
            },
          ]}>
          <Text
            style={{
              color:
                item?.data?.sender__email === walletData?.account_email
                  ? 'rgba(106, 106, 106, 1)'
                  : 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.semibold,
              fontSize: 12,
            }}>
            {item?.data?.content}
          </Text>
        </View>
      );
    }
    return (
      <Pressable
        onPress={() => {}}
        style={[
          styles.transactionCard,
          {
            backgroundColor: 'rgba(252, 252, 252, 1)',
            alignSelf:
              item?.data?.sender__wallet_public_key ===
                walletData?.wallet_public_key ||
              item?.data?.to_address__wallet_public_key ===
                walletData?.wallet_public_key ||
              item?.data?.requester__wallet_public_key ===
                walletData?.wallet_public_key
                ? 'flex-end'
                : 'flex-start',

            borderWidth: 2,
            borderColor: 'rgba(241, 241, 241, 1)',
            // borderLeftWidth: 6,
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          {isVisble3 ? (
            <Text
              style={{
                ...styles.amountText,
                color: '#000',
              }}>
              ${item?.data?.amount?.toFixed(2)}
            </Text>
          ) : (
            <Text
              style={{
                ...styles.amountText,
                color: '#000',
              }}>
              {Number(item?.data?.value)?.toFixed(4)}
            </Text>
          )}
          {item?.data?.status !== 'pending' &&
            item?.data?.status !== 'canceled' && (
              <SvgXml
                xml={SVGInfo}
                style={{marginLeft: -30}}
                onPress={() => {
                  console.log(item, 'cryptooosssss');
                  navigation.navigate('TXViewDetails', {
                    transactionLists: [
                      {
                        To:
                          item?.data?.recipient__wallet_public_key ??
                          item?.data?.to_wallet,
                      },
                      {
                        From:
                          item?.data?.sender__wallet_public_key ??
                          item?.data?.to_address__wallet_public_key,
                      },
                      {TxId: '1ertya34uiopchh-2345790'},
                      {Amount: item?.data?.amount + '$' ?? item?.data?.value},
                      {
                        Date: moment(item?.data?.timestamp).format(
                          'DD MMM YYYY , LT',
                        ),
                      },
                    ],
                    isCrypto: item?.data?.token,
                  });
                }}
              />
            )}
        </View>
        <Text
          style={{
            ...styles.typeText,
            marginLeft: 0,
            color:
              item?.data?.sender__wallet_public_key ===
                walletData?.wallet_public_key ||
              item?.data?.to_address__wallet_public_key ===
                walletData?.wallet_public_key
                ? 'rgba(0, 119, 4, 1)'
                : item?.data?.status === 'pending'
                ? 'rgba(255, 125, 32, 1)'
                : item?.data?.status === 'canceled'
                ? 'rgba(255, 35, 35, 1)'
                : 'rgba(52, 153, 224, 1)',
          }}>
          {item?.data?.sender__wallet_public_key ===
            walletData?.wallet_public_key ||
          item?.data?.to_address__wallet_public_key ===
            walletData?.wallet_public_key ? (
            <SvgXml
              xml={
                item?.data?.status === 'pending'
                  ? SVGRequested
                  : item?.data?.status === 'canceled'
                  ? SVGCanceled
                  : SVGSent
              }
            />
          ) : (
            <SvgXml
              xml={
                item?.data?.status === 'pending'
                  ? SVGRequested
                  : item?.data?.status === 'canceled'
                  ? SVGCanceled
                  : SVGReceived
              }
            />
          )}
          {item?.data?.sender__wallet_public_key ===
            walletData?.wallet_public_key ||
          item?.data?.to_address__wallet_public_key ===
            walletData?.wallet_public_key
            ? '  Paid'
            : item?.data?.status === 'pending'
            ? '  Pending'
            : item?.data?.status === 'canceled'
            ? '  Canceled'
            : '  Received'}{' '}
        </Text>
        <TouchableOpacity>
          <Text style={styles.dateText}>
            {item?.data?.status === 'pending'
              ? 'In Progress'
              : item?.data?.status === 'canceled'
              ? 'Canceled'
              : 'Paid'}{' '}
            • {moment(item?.data?.timestamp).format('DD MMM')} ✓
          </Text>
        </TouchableOpacity>
      </Pressable>
    );
  };

  const newArray2 = [...(items?.nft_transactions || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
  console.log(
    items?.filter(i => i?.type === 'nft_transaction'),
    'nft==>>',
  );
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today</Text>
      <FlatList
        data={
          !isVisble3
            ? items?.filter(i => i?.type !== 'crypto_transaction')
            : items?.filter(i => i?.type !== 'nft_transaction')
        }
        renderItem={renderItem}
        keyExtractor={item => item?.data?.id}
        contentContainerStyle={styles.listContainer}
        style={{flex: 1}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFF',
  },
  header: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#9E9E9E',
  },
  listContainer: {
    paddingVertical: 16,
  },
  transactionCard: {
    padding: 10,
    marginVertical: 8,
    borderRadius: 12,
    width: '60%',
    borderWidth: 3,
    borderColor: 'rgba(52, 153, 224, 0.07)',
    // elevation: ,
  },
  typeText: {
    fontSize: 12,
    fontFamily: Fonts.semibold,
    color: 'rgba(52, 153, 224, 1)',
    marginTop: 5,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(106, 106, 106, 1)',
    fontFamily: Fonts.regular,
    textAlign: 'right',
  },
});

export default TransactionList;
