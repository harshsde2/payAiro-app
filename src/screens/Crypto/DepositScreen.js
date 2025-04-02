import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {SVGInfo2, SVGLeftArrow, SVGSearch} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {
  depositAddress,
  getBalanceCrypto,
  getBlockchain,
} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import useDispatchAction from '../../hooks/useDispatchAction';
import {setErrorMsg} from '../../redux/slices/authenticationSlice';
import {useNavigation} from '@react-navigation/native';

export default function DepositScreen() {
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const [alloCationLists, setalloCationLists] = useState([]);
  useEffect(() => {
    handleBalance();
  }, []);

  const handleBalance = async () => {
    const data = await getBlockchain(tokens?.access);
    console.log(data?.data?.blockchains, 'data?.data?.blockchains');
    if (data?.data?.blockchains) {
      setalloCationLists(
        data?.data?.blockchains.filter(asset => asset.assetType !== 'usd'),
      );
    }
  };
  const handleDepositAddress = async item => {
    try {
      const data = await depositAddress(
        {
          network:
            item?.blockchain === 'Ethereum'
              ? 'sepolia'
              : item?.blockchain === 'Polygon'
              ? 'polygonAmoy'
              : 'bitcoinTestnet',
          asset_type: item?.tokens[0]?.symbol.toLowerCase(),
        },
        tokens?.access,
      );
      console.log(data?.data, 'data?.data.status');
      if (
        data?.data?.api_response &&
        data?.data?.api_response?.status === 400
      ) {
        if (
          data?.data?.api_response?.title ===
          'Operation is forbidden. Custodial account is suspended'
        ) {
          useDispatchAction(
            setErrorMsg(
              'Operation is forbidden. Custodial account is suspended',
            ),
          );
          setTimeout(() => {
            navigation.navigate('Dashboard', {
              item,
            });
          }, 2000);
        } else {
          useDispatchAction(
            setErrorMsg('Please verify your level 2 KYC From Dashboard'),
          );
          setTimeout(() => {
            navigation.navigate('Dashboard');
          }, 2000);
        }
      } else {
        console.log(data?.data?.address, 'address==>>>');
        navigation.navigate('DepositScreen2', {
          address: data?.data?.address,
          item,
        });
      }
    } catch (error) {
      useDispatchAction(
        setErrorMsg('Please verify your level 2 KYC From Dashboard'),
      );
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 2000);
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        title={'Crypto Deposit'}
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
          marginTop: 160,
          marginHorizontal: 10,
        }}>
        <Text style={{color: 'black', fontFamily: Fonts.bold, fontSize: 18}}>
          Choose Network
        </Text>
        {alloCationLists &&
          alloCationLists.length > 0 &&
          alloCationLists.map((i, k) => (
            <TouchableOpacity
              onPress={() => handleDepositAddress(i)}
              style={{marginTop: 20}}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: Fonts.regular,
                }}>
                {i?.blockchain}({i?.tokens[0]?.symbol})
              </Text>
              <Text
                style={{
                  color: 'rgba(106, 106, 106, 1)',
                  fontSize: 12,
                  fontFamily: Fonts.regular,
                  marginTop: 10,
                }}>
                1 block confirmation
              </Text>
              <Text
                style={{
                  color: 'rgba(106, 106, 106, 1)',
                  fontSize: 12,
                  fontFamily: Fonts.regular,
                }}>
                Min. deposit >0.000006 {i?.tokens[0]?.symbol}
              </Text>
              <View
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'rgba(217, 217, 217, 1)',
                  marginVertical: 20,
                }}
              />
            </TouchableOpacity>
          ))}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            backgroundColor: 'rgba(226, 241, 227, 1)',
            padding: 10,
            borderRadius: 10,
            position: 'absolute',
            bottom: 10,
            alignSelf: 'center',
          }}>
          <SvgXml xml={SVGInfo2} />
          <Text
            style={{
              marginLeft: 5,
              color: 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.regular,
              width: '90%',
              fontSize: 13,
            }}>
            Please note that only supported networks on Binance platform are
            shown, it you deposit via another network your assets may be lost.
          </Text>
        </View>
      </View>
    </CommonHeaderv2>
  );
}
