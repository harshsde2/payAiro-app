import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {
  SVGEth,
  SVGLeftArrow,
  SVGRight,
  SVGSearch,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import CryptoHoldingsCarrd from '../../components/CryptoHoldingsCarrd';
import {COIN_LISTS} from '../../constants/mockData';
import {getBlockchain, getCryptoPrice} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';

export default function CryptoScreen() {
  const {tokens} = useSelectorAction();
  const [activeTab, setactiveTab] = useState('1');
  const [activeCoin, setactiveCoin] = useState('1');
  const [blockchansList, setblockchansList] = useState([]);

  useEffect(() => {
    getBlockchainData();
  }, []);

  const handleCoinTab = tab => {
    setactiveCoin(tab);
  };

  const getBlockchainData = async () => {
    const data = await getCryptoPrice(tokens?.access);
    console.log(data?.data, 'data?.data?.blockchains');
    setblockchansList(data?.data);
  };

  return (
    <CommonHeaderv2 isBottomNav={true} isCrypto={true}>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Securities Holdings'}
        rightIcon={SVGSearch}
      />
      <View
        style={{
          padding: 5,
          backgroundColor: 'rgba(236, 241, 237, 1)',
          borderRadius: 40,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '90%',
          alignSelf: 'center',
        }}>
        <TouchableOpacity
          onPress={() => setactiveTab('1')}
          style={{
            backgroundColor:
              activeTab === '1' ? 'rgba(44, 106, 63, 1)' : 'transparent',
            width: '50%',
            borderRadius: 30,
            padding: 15,
          }}>
          <Text
            style={{
              color: activeTab === '1' ? 'white' : 'black',
              marginLeft: 10,
              fontFamily: Fonts.semibold,
              fontSize: 14,
              textAlign: 'center',
            }}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setactiveTab('2')}
          style={{
            backgroundColor:
              activeTab === '2' ? 'rgba(44, 106, 63, 1)' : 'transparent',
            width: '50%',
            borderRadius: 30,
            padding: 15,
          }}>
          <Text
            style={{
              color: activeTab === '2' ? 'white' : 'black',
              marginLeft: 10,
              fontFamily: Fonts.semibold,
              fontSize: 14,
              textAlign: 'center',
            }}>
            Explore
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 15,
          marginTop: 20,
        }}>
        {activeTab === '2' ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => handleCoinTab('1')}
                style={{
                  width: '23%',
                  padding: 7,
                  backgroundColor:
                    activeCoin === '1' ? 'black' : 'rgba(43, 43, 43, 0.12)',
                  margin: 5,
                  borderRadius: 30,
                }}>
                <Text
                  style={{
                    color: activeCoin === '1' ? 'white' : 'black',
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  USDT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCoinTab('2')}
                style={{
                  width: '23%',
                  padding: 7,
                  backgroundColor:
                    activeCoin === '2' ? 'black' : 'rgba(43, 43, 43, 0.12)',
                  margin: 5,
                  borderRadius: 30,
                }}>
                <Text
                  style={{
                    color: activeCoin === '2' ? 'white' : 'black',
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  BTC
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCoinTab('3')}
                style={{
                  width: '23%',
                  padding: 7,
                  backgroundColor:
                    activeCoin === '3' ? 'black' : 'rgba(43, 43, 43, 0.12)',
                  margin: 5,
                  borderRadius: 30,
                }}>
                <Text
                  style={{
                    color: activeCoin === '3' ? 'white' : 'black',
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  INR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCoinTab('4')}
                style={{
                  width: '23%',
                  padding: 7,
                  backgroundColor:
                    activeCoin === '4' ? 'black' : 'rgba(43, 43, 43, 0.12)',
                  margin: 5,
                  borderRadius: 30,
                }}>
                <Text
                  style={{
                    color: activeCoin === '4' ? 'white' : 'black',
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                  ALTs
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{padding: 10, marginBottom: 100}}>
              {blockchansList &&
                blockchansList?.length > 0 &&
                blockchansList?.map((i, k) => (
                  <CryptoHoldingsCarrd key={k} item={i} />
                ))}
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 7,
              }}>
              <View>
                <Text
                  style={{fontFamily: Fonts.bold, fontSize: 18, color: '#000'}}>
                  Trending
                </Text>
                <Text
                  style={{
                    color: 'rgba(106, 106, 106, 1)',
                    fontSize: 14,
                    fontFamily: Fonts.regular,
                  }}>
                  Top Price fluctuation in the past 2 hrs
                </Text>
              </View>
              <SvgXml xml={SVGRight} />
            </View>

            {blockchansList &&
              blockchansList?.length > 0 &&
              blockchansList
                .slice(0, 6)
                .map((i, k) => <CryptoHoldingsCarrd key={k} item={i} />)}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 7,
              }}>
              <View>
                <Text
                  style={{fontFamily: Fonts.bold, fontSize: 18, color: '#000'}}>
                  Most traded
                </Text>
                <Text
                  style={{
                    color: 'rgba(106, 106, 106, 1)',
                    fontSize: 14,
                    fontFamily: Fonts.regular,
                  }}>
                  Top tokens by volume in the past 24 hrs
                </Text>
              </View>
              <SvgXml xml={SVGRight} />
            </View>

            {blockchansList &&
              blockchansList?.length > 0 &&
              blockchansList
                .slice(5, 8)
                .map((i, k) => <CryptoHoldingsCarrd key={k} item={i} />)}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 7,
              }}>
              <View>
                <Text
                  style={{fontFamily: Fonts.bold, fontSize: 18, color: '#000'}}>
                  Large cap
                </Text>
                <Text
                  style={{
                    color: 'rgba(106, 106, 106, 1)',
                    fontSize: 14,
                    fontFamily: Fonts.regular,
                  }}>
                  Top tokens by volume in the past 24 hrs
                </Text>
              </View>
              <SvgXml xml={SVGRight} />
            </View>

            {blockchansList &&
              blockchansList?.length > 0 &&
              blockchansList
                .slice(8, 9)
                .map((i, k) => <CryptoHoldingsCarrd key={k} item={i} />)}
          </>
        )}
      </View>
    </CommonHeaderv2>
  );
}
