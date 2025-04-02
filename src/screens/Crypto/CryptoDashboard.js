import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGGraph,
  SVGLeftArrow,
  SVGSearch,
  SVGSort,
  SVGSuGrph,
} from '../../constants/images';
import HeaderTitle2 from '../../components/HeaderTitle2';
import Fonts from '../../constants/Fonts';
import LineChartCustom from '../../components/LineChartCustom';
import {SvgXml} from 'react-native-svg';
import CrryptoCard from '../../components/CrryptoCard';
import {CRYPTO_HOLDINGS} from '../../constants/mockData';
import BottomNaviCrypto from '../../components/BottomNaviCrypto';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {getBalanceCrypto} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import WithdrawModal from '../../components/WithdrawModal';

export default function CryptoDashboard() {
  const {tokens} = useSelectorAction();
  const navigation = useNavigation();
  const [alloCationLists, setalloCationLists] = useState([]);
  const [isVisible, setisVisible] = useState(false);

  useEffect(() => {
    handleBalance();
  }, []);

  const handleBalance = async () => {
    const data = await getBalanceCrypto(tokens?.access);
    console.log(data?.data?.data, 'cryptoBalance');
    if (data?.data?.data) {
      setalloCationLists(
        data?.data?.data.filter(asset => asset.assetType !== 'usd'),
      );
    }
  };
  return (
    <CommonHeaderv2 isBottomNav={true} isCrypto={true}>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Securities Holdings'}
        rightIcon={SVGSearch}
      />
      <WithdrawModal
        isVisible={isVisible}
        onCancel={() => setisVisible(false)}
        onClose={() => setisVisible(false)}
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
        <Text style={{color: '#000', fontFamily: Fonts.bold, fontSize: 18}}>
          Stocks (5)
        </Text>
        <View
          style={{
            backgroundColor: '#000',
            padding: 12,
            borderRadius: 10,
            marginVertical: 15,
            // margin: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                }}>
                Current
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 18,
                  fontFamily: Fonts.semibold,
                }}>
                $23,098.80
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                }}>
                Total Returns
              </Text>
              <Text
                style={{
                  color: 'rgba(236, 105, 72, 1)',
                  fontSize: 18,
                  fontFamily: Fonts.semibold,
                }}>
                $23,098.80
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 35,
              marginBottom: 14,
            }}>
            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                }}>
                Invested
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 18,
                  fontFamily: Fonts.semibold,
                }}>
                $23,098.80
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                }}>
                ID Returns
              </Text>
              <Text
                style={{
                  color: 'rgba(236, 105, 72, 1)',
                  fontSize: 18,
                  fontFamily: Fonts.semibold,
                }}>
                $23,098.80
              </Text>
            </View>
          </View>
          <SvgXml
            xml={SVGGraph}
            style={{alignSelf: 'center', width: '90%'}}
            width={320}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: 5,
            }}>
            <GenericButton
              onPress={() => navigation.navigate('DepositScreen')}
              title="Deposit"
              cStyle={{width: '45%', paddingBottom: 15, paddingTop: 10}}
            />
            <GenericButton
              title="Withdraw"
              onPress={() => setisVisible(true)}
              cStyle={{
                width: '45%',
                paddingBottom: 15,
                paddingTop: 10,
                backgroundColor: 'rgba(226, 241, 227, 1)',
              }}
              tStyle={{color: 'rgba(44, 106, 63, 1)'}}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10,
          }}>
          <Text style={{color: 'black', fontFamily: Fonts.bold, fontSize: 16}}>
            Sort <SvgXml xml={SVGSort} />
          </Text>

          <Text
            style={{
              color: 'rgba(106, 106, 106, 1)',
              fontFamily: Fonts.regular,
              fontSize: 12,
            }}>
            {'< >'}Current (Invested)
          </Text>
        </View>
        {alloCationLists &&
          alloCationLists?.length > 0 &&
          alloCationLists.map((i, k) => (
            <CrryptoCard key={k} item={i} type={'holdings'} />
          ))}
        <View style={{paddingBottom: 100}} />
      </View>
    </CommonHeaderv2>
  );
}
