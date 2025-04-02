import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {
  SVGInfo2,
  SVGLeftArrow,
  SVGSearch,
  SVGTextImage,
} from '../../constants/images';
import LineChartCustom from '../../components/LineChartCustom';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import {HOLDINDS_DETAILS} from '../../constants/mockData';
import {useNavigation} from '@react-navigation/native';

export default function HoldingsScreen(props) {
  const {item} = props.route.params;
  const navigation = useNavigation();
  console.log(item, 'itemitemitemitemitem');
  const [selectedFilter, setselectedFilter] = useState('12hours');
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Securities Holdings'}
        rightIcon={SVGSearch}
      />
      <View style={{margin: 10}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            {/* <SvgXml xml={SVGTextImage} />
             */}
            {/* <View style={{width: '60%'}}></View> */}
            <Image
              source={{uri: item?.logo, width: '60%'}}
              style={{width: 50, height: 50}}
            />
            <View style={{marginLeft: 8, width: '60%'}}>
              <Text
                style={{color: 'black', fontFamily: Fonts.bold, fontSize: 18}}>
                {item?.network?.toUpperCase()}, {item?.currency?.toUpperCase()}{' '}
                <SvgXml
                  xml={SVGInfo2}
                  onPress={() => {
                    navigation.navigate('DetailsCryptoScreen', {
                      url:
                        item?.currency === 'eth'
                          ? 'https://www.coingecko.com/en/coins/ethereum'
                          : item?.currency === 'matic'
                          ? 'https://www.coingecko.com/en/coins/pol-ex-matic'
                          : 'https://www.coingecko.com/en/coins/bitcoin',
                    });
                  }}
                />
              </Text>
              <Text
                style={{
                  color: 'rgba(106, 106, 106, 1)',
                  fontFamily: Fonts.semibold,
                  fontSize: 12,
                }}>
                Multinational Technology
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.bold,
              fontSize: 18,
              width: '50%',
              marginLeft: 10,
            }}>
            ${Number(item?.price?.buy)?.toFixed(3)}
          </Text>
        </View>
        <LineChartCustom isNoBg={true} timeframe={'week'.toLowerCase()} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 7,
            backgroundColor: 'rgba(44, 106, 63, 0.3)',
            borderRadius: 30,
            marginVertical: 12,
          }}>
          <TouchableOpacity
            onPress={() => setselectedFilter('12hour')}
            style={{
              backgroundColor:
                selectedFilter === '12hour' ? '#000' : 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: '20%',
            }}>
            <Text
              style={{
                color: selectedFilter === '12hour' ? '#fff' : '#000',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 10,
              }}>
              12H
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedFilter('oneDay')}
            style={{
              backgroundColor:
                selectedFilter === 'oneDay' ? '#000' : 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: '20%',
            }}>
            <Text
              style={{
                color: selectedFilter === 'oneDay' ? '#fff' : '#000',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 10,
              }}>
              1D
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedFilter('oneWeek')}
            style={{
              backgroundColor:
                selectedFilter === 'oneWeek' ? '#000' : 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: '20%',
            }}>
            <Text
              style={{
                color: selectedFilter === 'oneWeek' ? '#fff' : '#000',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 10,
              }}>
              1W
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedFilter('oneMonth')}
            style={{
              backgroundColor:
                selectedFilter === 'oneMonth' ? '#000' : 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: '20%',
            }}>
            <Text
              style={{
                color: selectedFilter === 'oneMonth' ? '#fff' : '#000',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 10,
              }}>
              1M
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedFilter('oneYear')}
            style={{
              backgroundColor:
                selectedFilter === 'oneYear' ? '#000' : 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: '20%',
            }}>
            <Text
              style={{
                color: selectedFilter === 'oneYear' ? '#fff' : '#000',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 10,
              }}>
              1Y
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
          marginHorizontal: 10,
        }}>
        {HOLDINDS_DETAILS.map((i, k) => (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 18,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.regular,
                  color: 'rgba(106, 106, 106, 1)',
                }}>
                {i.label}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.regular,
                  color: 'rgba(106, 106, 106, 1)',
                }}>
                {i.value}
              </Text>
            </View>
            <View
              style={{
                borderBottomWidth: 0.7,
                borderColor: 'rgba(242, 242, 242, 1)',
              }}
            />
          </>
        ))}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 20,
          }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Sell', {
                item,
              })
            }
            style={{
              width: '49%',
              padding: 16,
              backgroundColor: 'rgba(247, 87, 87, 1)',
              borderRadius: 40,
            }}>
            <Text
              style={{
                color: '#fff',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 16,
              }}>
              Sell
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Buy', {
                item,
              })
            }
            style={{
              width: '49%',
              padding: 16,
              backgroundColor: 'rgba(23, 161, 11, 1)',
              borderRadius: 40,
            }}>
            <Text
              style={{
                color: '#fff',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 16,
              }}>
              Buy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CommonHeaderv2>
  );
}
