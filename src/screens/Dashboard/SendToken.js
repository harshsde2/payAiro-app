import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import React, {useState} from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import Fonts from '../../constants/Fonts';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGDownArrow,
  SVGDownArrow2,
  SVGLeftArrow,
  SVGLocation,
  SVGRightIcon,
  SVGSwap,
  SVGSearch,
  SVGUSD,
  SVGDownArrow3,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import GenericButton from '../../components/GenericButton';
import TextInputField from '../../components/TextInputField';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import useSelectorAction from '../../hooks/useSelectorAction';
import SelectionModal from '../../components/SelectionModal';
import {sendCrypto} from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import PincodeScreen from '../Authentications/PincodeScreen';
import {getPin} from '../../services/Auth';
import HeaderTitle2 from '../../components/HeaderTitle2';

export default function SendToken(props) {
  const {selectedCrypto, bankBalance, networkLists, tokens, bankLists} =
    useSelectorAction();
  const {sender, type} = props.route.params;
  const [amount, setamount] = useState('');
  const [address, setaddress] = useState(sender ?? '');
  const [pinvisible, setpinvisible] = useState(false); // State to store the input value
  const [selectedAccount, setselectedAccount] = useState(
    bankLists?.filter(i => i?.account_type !== undefined)[0] ?? null,
  );

  const [selectionModalVisible, setselectionModalVisible] = useState(false);
  const symbol = selectedCrypto?.image?.includes('btc')
    ? 'BTC'
    : selectedCrypto?.image?.includes('eth')
    ? 'ETH'
    : selectedCrypto?.image?.includes('matic')
    ? 'MATIC'
    : 'XRP';

  const balanceAssetsUSDT = (
    Number(networkLists[0]?.balance_in_tether || 0) +
    Number(networkLists[1]?.balance_in_tether || 0) +
    Number(networkLists[2]?.balance_in_tether || 0) +
    Number(networkLists[3]?.balance_in_tether || 0)
  ).toFixed(3);

  console.log(balanceAssetsUSDT);
  const handleCrypto = async () => {
    if (!address.trim()) {
      useDispatchAction(setErrorMsg('Amount & Address are required'));
      return;
    }
    // if (data && data?.status) {
    //   useDispatchAction(setSuccessMsg('Transaction Successful'));
    //   navigation.navigate('SendReceipt', {
    //     transactionDetails: [
    //       {
    //         Sender: data?.data?.transaction?.sender,
    //       },
    //       {Recipient: data?.data?.transaction?.recipient},
    //       {Network: data?.data?.transaction?.currency},
    //       {'Transaction Id': data?.data?.transaction?.transaction_id},
    //       {Amount: data?.data?.transaction?.amount},
    //       {PayAiroTag: data?.data?.transaction?.payairoTag},
    //     ],
    //   });
    // } else {
    //   useDispatchAction(
    //     setErrorMsg(data?.data?.error ?? 'Something went wrong'),
    //   );
    // }
    navigation.navigate('ScanPay', {
      bank: selectedAccount,
      sender: address,
      type: 'crypto',
    });
  };
  const navigation = useNavigation();
  return (
    <CommonHeaderv2>
      {pinvisible && (
        <PincodeScreen
          onPress={async e => {
            if (e.length === 4) {
              const data = await getPin();
              if (e === data) {
                setpinvisible(false);
                handleCrypto();
              }
            } else {
              useDispatchAction(
                setErrorMsg('Please enter correct pin to proceed for payment'),
              );
            }

            // setshowPin(false);
          }}
        />
      )}
      {!pinvisible && (
        <>
          <SelectionModal
            isVisible={selectionModalVisible}
            data={bankLists?.filter(i => i?.account_type !== undefined) ?? []}
            onClose={() => setselectionModalVisible(false)}
            onSelected={e => setselectedAccount(e)}
          />
          <HeaderTitle2
            title={`${type === 'receive' ? 'Receive' : 'Send'} Token`}
            leftIcon={SVGLeftArrow}
            rightIcon={SVGSearch}
          />

          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            <Text style={{fontFamily: Fonts.semibold, padding: 10}}>From</Text>
            <TouchableOpacity
              onPress={() => setselectionModalVisible(true)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderWidth: 1,
                borderColor: 'rgba(106, 106, 106, 0.08)',
                borderRadius: 10,
                padding: 10,
                margin: 5,
                marginBottom: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <SvgXml xml={SVGUSD} width={40} height={40} />
                <View style={{marginHorizontal: 10, width: '70%'}}>
                  <Text
                    style={{
                      fontFamily: Fonts.semibold,
                      textTransform: 'capitalize',
                      color: 'black',
                      fontSize: 12,
                    }}>
                    {selectedAccount?.bank_name ?? selectedAccount?.name} (
                    {selectedAccount?.account_type ?? 'External'})
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: Fonts.semibold,
                      color: 'rgba(106, 106, 106, 1)',
                      fontSize: 10,
                    }}>
                    {selectedAccount?.balances?.available
                      ? selectedAccount?.balances?.available
                      : selectedAccount?.account_type === 'rothIra'
                      ? bankBalance?.roth_ira_account?.usd
                      : selectedAccount?.account_type === 'traditionalIra'
                      ? bankBalance?.traditional_ira_account?.usd
                      : bankBalance?.bank_account?.usd}
                  </Text>
                </View>
              </View>
              <SvgXml xml={SVGDownArrow3} />
            </TouchableOpacity>

            {/* <Text
          style={{
            color: '#000',
            fontFamily: Fonts.semibold,
            fontSize: 12,
            marginLeft: 10,
            marginTop: 5,
          }}>
          Total Tokens : Payairo 3,000,90.89 ~ $400,00,00.90
        </Text> */}

            <TextInputField
              editable={sender === '' || sender === undefined}
              label={'To'}
              placeholder={'Name,$Airtag,Phone,Emai'}
              isIcon={SVGLocation}
              icon={SVGLocation}
              iStyle={{
                backgroundColor: 'rgba(106, 106, 106, 0.12)',
                paddingLeft: 10,
                borderRadius: 10,
                paddingVertical: 8,
              }}
              cStyle={{marginTop: 13, borderRadius: 10}}
              value={address}
              onChange={setaddress}
            />

            {/* <Text
              style={{
                color: 'rgba(106, 106, 106, 1)',
                fontFamily: Fonts.semibold,
                marginTop: 60,
                textAlign: 'center',
                width: '80%',
                alignSelf: 'center',
              }}>
              Here estimated send amount after fee deduction will appear
            </Text> */}
            <GenericButton
              title={type === 'receive' ? 'Receive' : 'Send'}
              cStyle={{marginTop: 307}}
              onPress={() => handleCrypto()}
            />
          </View>
        </>
      )}
    </CommonHeaderv2>
  );
}