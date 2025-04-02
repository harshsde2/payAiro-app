import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGBankCard,
  SVGCCard,
  SVGCard3,
  SVGLeftArrow,
  SVGLoan,
  SVGSlider,
} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import {FINANCE_LISTS} from '../../constants/constant';
import WalletCard from '../../components/WalletCard';
import {useNavigation} from '@react-navigation/native';

const BankDetails = props => {
  const {item, bankbalance} = props.route.params;
  const navigation = useNavigation();
  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Finance'} leftIcon={SVGLeftArrow} />
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}>
            <View style={{width: '70%'}}>
            </View>
            <SvgXml xml={SVGCCard} style={{marginHorizontal: 10}} />
            <SvgXml xml={SVGCard3} style={{marginHorizontal: 10}} />
          </ScrollView> */}
          <WalletCard data={item} bankbalance={bankbalance} />

          <SvgXml
            xml={SVGSlider}
            style={{alignSelf: 'center', marginBottom: 20}}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              //   marginTop: 20,
              height: 400,
            }}>
            <ScrollView>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}>
                {FINANCE_LISTS.map((i, k) => (
                  <TouchableOpacity
                    onPress={() => {
                      if (i.route)
                        navigation.navigate(i.route, {
                          requested: false,
                        });
                    }}
                    style={{
                      width: '30%',
                      marginHorizontal: 5,
                      marginVertical: 10,
                    }}>
                    <View
                      style={{
                        backgroundColor: 'rgba(226, 241, 227, 0.2)',
                        borderRadius: 20,
                        padding: 30,
                        borderWidth: 1,
                        borderColor: 'rgba(226, 241, 227, 1)',
                      }}>
                      <SvgXml xml={i?.icon} style={{alignSelf: 'center'}} />
                    </View>
                    <Text
                      style={{
                        color: 'rgba(106, 106, 106, 1)',
                        fontFamily: Fonts.regular,
                        textAlign: 'center',
                        marginTop: 5,
                      }}>
                      {i.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    marginVertical: 10,
    // flex: 1,
  },
  card: {
    width: 300,
    height: 150,
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  amount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default BankDetails;
