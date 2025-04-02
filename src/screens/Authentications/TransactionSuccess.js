import {View, Text} from 'react-native';
import React from 'react';
import Container from '../../HOC/Container';
import {SvgCss, SvgXml} from 'react-native-svg';
import {SVGSucc} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {TRANSACTION_HISTORY} from '../../constants/constant';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';

export default function TransactionSuccess(props) {
  const {transactionDetails} = props?.route?.params;
  console.log(transactionDetails, 'datatata');
  const formattedTransactionHistory = transactionDetails?.map(entry => {
    const key = Object.keys(entry)[0];
    const value = entry[key];
    return {label: key, value};
  });
  const navigation = useNavigation();

  return (
    <Container>
      <SvgXml xml={SVGSucc} style={{alignSelf: 'center', marginVertical: 20}} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
        }}>
        <View style={{width: '90%', alignSelf: 'center'}}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              textAlign: 'center',
              marginTop: 5,
              fontSize: 26,
              marginBottom: 10,
            }}>
            Transaction successful{' '}
          </Text>
          {formattedTransactionHistory.map(({label, value}, index) => (
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
                  fontSize: 10,
                  width: '60%',
                  textAlign: 'right',
                }}>
                {value}
                {label.includes('Amount') || label.includes('Sent')
                  ? ' $'
                  : null}
              </Text>
            </View>
          ))}

          {/* <GenericButton
            title={'Invoice'}
            cStyle={{backgroundColor: '#000', marginVertical: 10}}
            tStyle={{color: 'white'}}
            onPress={() => navigation.navigate(SCREENS.TransactionDetails)}
          /> */}
          <GenericButton
            title={'Done'}
            cStyle={{marginTop: 40}}
            onPress={() => navigation.navigate(SCREENS.Dashboard)}
          />
        </View>
      </View>
    </Container>
  );
}
