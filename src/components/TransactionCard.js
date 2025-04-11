import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {
  SVGFailure,
  SVGProfile2,
  SVGSucc,
  SVGSuccess,
} from '../constants/images';
import Fonts from '../constants/Fonts';
import moment from 'moment';
import useSelectorAction from '../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';

export default function TransactionCard({item, isCrypto, isMerchent}) {
  const {walletData} = useSelectorAction();
  const navigation = useNavigation();
  return (
    <>
      <TouchableOpacity
        disabled={isCrypto}
        onPress={() => {
          console.log(item, 'clg');
          if (isMerchent) {
            navigation.navigate('TransactionSuccess', {
              transactionDetails: [
                {'Order Id': item?.order_id},
                {'Sender ID': item?.sender_wallet},
                {'Recipient ID': item?.recipient_wallet},
                {'Requested Amount': item?.amount},
                {'Successfully Sent': item?.amount},
                {Status: item?.status?.toUpperCase()},
              ],
            });
          }

          if (isCrypto && !isMerchent && item?.web3) {
            Linking.openURL(
              `https://sepolia.etherscan.io/tx/0x${item?.tx_hash}`,
            );
          }

          if (isCrypto && !isMerchent && !item?.web3) {
            navigation.navigate('SendReceipt', {
              transactionDetails: [
                {
                  From: item?.from_currency,
                },
                {To: item?.to_currency},
                {Network: item?.network},
                {'Trade Id': item?.trade_id},
                {Amount: item?.amount},
                {'Account ID': item?.account_id},
              ],
            });
          }

          if (!isCrypto && !isMerchent) {
            navigation.navigate('TransactionSuccess', {
              transactionDetails: [
                {'Transaction Id': item?.transaction_id},
                {
                  'Transfer Date': moment(
                    item?.timestamp ?? item?.created_at,
                  ).format('DD MMM YYYY'),
                },
                {Sender: item?.sender_username},
                {'Receiver ID': item?.recipient_username},
                {'Requested Amount': item?.amount},
                {'Successfully Sent': item?.amount},
              ],
            });
          }
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          {isCrypto && !isMerchent ? (
            <SvgXml xml={item?.type === 'sell' ? SVGFailure : SVGSuccess} />
          ) : (
            <View
              style={[
                {
                  width: 40,
                  height: 40,
                  borderRadius: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                },
                {backgroundColor: 'rgba(255, 37, 99, 1)'},
              ]}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 16,
                  fontFamily: Fonts.semibold,
                }}>
                {item?.project_name
                  ? item?.project_name.charAt(0)?.toUpperCase()
                  : walletData?.username === item?.sender_username
                  ? item?.recipient_username?.charAt(0)?.toUpperCase() +
                    item?.recipient_username?.charAt(1)?.toUpperCase()
                  : item?.sender_username?.charAt(0)?.toUpperCase() +
                    item?.sender_username?.charAt(1)?.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{marginLeft: 10}}>
            <Text
              style={{fontFamily: Fonts.semibold, fontSize: 14, width: '80%'}}>
              {item?.recipient_username ??
                item?.to_currency?.toUpperCase() ??
                item?.token?.toUpperCase()}
            </Text>

            <Text
              style={{fontFamily: Fonts.regular, fontSize: 12, marginTop: 5}}>
              {moment(item?.timestamp ?? item?.created_at).format(
                'DD-MMM-YYYY, LT',
              )}
            </Text>
          </View>
        </View>
        {!isCrypto ? (
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 16,
              color:
                walletData?.username === item?.sender_username
                  ? 'red'
                  : 'green',
            }}>
            {walletData?.username === item?.sender_username ? '-' : '+'}$
            {item?.amount}
          </Text>
        ) : isMerchent ? (
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 16,
              color: isMerchent ? 'red' : 'green',
            }}>
            -${Number(item?.value ?? item?.amount).toFixed(5)}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 16,
              color: isMerchent ? 'red' : 'green',
            }}>
            {Number(item?.value ?? item?.amount).toFixed(5)}{' '}
            {item?.token?.toUpperCase() ?? `USD`}
          </Text>
        )}
      </TouchableOpacity>
      <View
        style={{
          borderBottomWidth: 1,
          marginVertical: 7,
          borderColor: 'rgba(224, 224, 224, 1)',
        }}
      />
    </>
  );
}
