import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import React from 'react';
import CommonContainer from '../../HOC/CommonContainer';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import Fonts from '../../constants/Fonts';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGDownArrow,
  SVGDownArrow2,
  SVGLeftArrow,
  SVGLocation,
  SVGProfile,
  SVGRightIcon,
  SVGSwap,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import GenericButton from '../../components/GenericButton';
import TextInputField from '../../components/TextInputField';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';

export default function SendReceipt(props) {
  const navigation = useNavigation();
  const {transactionDetails} = props.route.params;
  const formattedTransactionHistory = transactionDetails?.map(entry => {
    const key = Object.keys(entry)[0];
    const value = entry[key];
    return {label: key, value};
  });
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Send Token - Reciept'} leftIcon={SVGLeftArrow} />
      <ScrollView contentContainerStyle={{flex: 1}}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderTopEndRadius: 32,
            borderTopStartRadius: 32,
            padding: 20,
          }}>
          {transactionDetails[0].From ? null : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <View
                style={[
                  {
                    width: 60,
                    height: 60,
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
                  {transactionDetails[1]?.Recipient?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <View style={{marginLeft: 10}}>
                <Text
                  style={{color: '#000', fontFamily: Fonts.bold, fontSize: 16}}>
                  {transactionDetails[1]?.Recipient}
                </Text>
                <Text
                  style={{
                    color: 'rgba(106, 106, 106, 0.7)',
                    fontFamily: Fonts.regular,
                    fontSize: 12,
                  }}>
                  6586 5589 4586 2231
                </Text>
              </View>
            </View>
          )}
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(228, 228, 228, 1)',
              marginVertical: 8,
            }}
          />

          {formattedTransactionHistory.map(({label, value}, index) => (
            <>
              {label?.includes('Address') && (
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(228, 228, 228, 1)',
                    marginVertical: 8,
                  }}
                />
              )}
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    color: 'black',
                    marginVertical: 15,
                  }}>
                  {label}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: Fonts.regular,
                    color: 'black',
                    marginVertical: 15,
                    fontSize: 18,
                    width: '60%',
                    textAlign: 'right',
                  }}>
                  {value}
                  {label.includes('Amount') || label.includes('Sent')
                    ? ' $'
                    : null}
                </Text>
              </View>
            </>
          ))}

          <GenericButton
            title={'Done'}
            cStyle={{marginTop: 280}}
            onPress={() => {
              navigation.navigate(SCREENS.Dashboard);
            }}
          />
        </View>
      </ScrollView>
    </CommonHeaderv2>
  );
}
