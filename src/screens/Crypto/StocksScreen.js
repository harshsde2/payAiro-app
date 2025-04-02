import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {SVGLeftArrow, SVGSearch, SVGStockImg} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import StocksCard from '../../components/StocksCard';

export default function StocksScreen() {
  return (
    <CommonHeaderv2 isBottomNav={true} isCrypto={true}>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Securities Holdings'}
        rightIcon={SVGSearch}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 15,
          marginTop: 20,
        }}>
        {/* Ensure ScrollView is inside a non-flex parent */}
        <View style={{marginVertical: 10}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              flexDirection: 'row',
            }}>
            <View
              style={{
                backgroundColor: 'rgba(249, 249, 249, 1)',
                width: 150,
                height: 70,
                padding: 12,
                borderRadius: 10,
                marginRight: 10, // Add margin between items
                borderWidth: 1,
                borderColor: 'rgba(239, 239, 239, 1)',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.semibold,
                  color: 'black',
                }}>
                Bitcoin
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                  color: 'black',
                  marginTop: 5,
                }}>
                23,073.60<Text style={{color: 'red'}}>-308.00 (1.32%)</Text>
              </Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(249, 249, 249, 1)',
                width: 150,
                height: 70,
                padding: 12,
                borderRadius: 10,
                marginRight: 10, // Add margin between items
                borderWidth: 1,
                borderColor: 'rgba(239, 239, 239, 1)',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.semibold,
                  color: 'black',
                }}>
                Polygon
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                  color: 'black',
                  marginTop: 5,
                }}>
                23,073.60<Text style={{color: 'red'}}>-308.00 (1.32%)</Text>
              </Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(249, 249, 249, 1)',
                width: 150,
                height: 70,
                padding: 12,
                borderRadius: 10,
                marginRight: 10, // Add margin between items
                borderWidth: 1,
                borderColor: 'rgba(239, 239, 239, 1)',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.semibold,
                  color: 'black',
                }}>
                Ethereum
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                  color: 'black',
                  marginTop: 5,
                }}>
                23,073.60<Text style={{color: 'red'}}>-308.00 (1.32%)</Text>
              </Text>
            </View>
          </ScrollView>
        </View>
        <View style={{margin: 10}}>
          <Text style={{fontSize: 18, fontFamily: Fonts.bold, color: 'black'}}>
            Most traded on Stocks
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
            <StocksCard />
            <StocksCard />

            <StocksCard />

            <StocksCard />
          </View>
        </View>

        <View style={{margin: 10, marginBottom: 100}}>
          <Text style={{fontSize: 18, fontFamily: Fonts.bold, color: 'black'}}>
            Most Traded For Crypto
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
            <StocksCard />
            <StocksCard />

            <StocksCard />

            <StocksCard />
          </View>
        </View>
      </View>
    </CommonHeaderv2>
  );
}
