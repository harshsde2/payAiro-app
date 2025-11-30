import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGEth, SVGLeftArrow, SVGTextImage} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';
import GenericButton from '../../components/GenericButton';
import useSelectorAction from '../../hooks/useSelectorAction';
import { showError, showSuccess } from '../../utils/toast';
import {
  calculateAmount,
  calculateQuantity,
  sell,
} from '../../services/Services';
import {useNavigation} from '@react-navigation/native';
import FullScreenModal from '../../components/FullScreenModal';

export default function Sell(props) {
  const {item} = props.route.params;
  const [selectedFilter, setselectedFilter] = useState('12hour');
  const {tokens} = useSelectorAction();
  const [amount, setamount] = useState(0);
  const [quantity, setquantity] = useState('');
  const navigation = useNavigation();
  const [bankSelected, setbankSelected] = useState(null); // State to store the input value

  const [isVisibleBank, setisVisibleBank] = useState(false); // State to store the input value

  const handleSubmit = async () => {
    console.log({
      from_asset: 'usd',
      from_amount: Number(amount),
      to_asset: item?.currency,
      network: item?.network,
      comment: 'Selling ETH to USD',
      fund_source:
        bankSelected?.account_type === 'rothIra'
          ? 'roth_ira'
          : bankSelected?.account_type === 'traditionalIra'
          ? 'traditional_ira'
          : 'bank',
    });
    try {
      const data = await sell(
        {
          from_asset: item?.currency,
          from_amount: Number(amount),
          to_asset: 'usd',
          network: item?.network,
          comment: 'Selling ETH to USD',
        },
        tokens?.access,
      );
      console.log(data, 'datatata');

      if (data && data?.data.message === 'Sell trade successful') {
        showSuccess('Sell trade successful');
        navigation.goBack();
      } else {
        showError('Insufficient account balanc');
      }
    } catch (error) {
      showError('Insufficient account balanc');
    }
  };

  const handleQuantityChange = async (value, type) => {
    try {
      let data;
      if (type === 'quantity') {
        setquantity(value);
        data = await calculateAmount({
          network: item?.network,
          currency: item?.currency,
          quantity: Number(value),
        });
        setamount(data?.data?.usd_amount?.toString());
      } else if (type === 'amount') {
        setamount(value);
        data = await calculateQuantity({
          network: item?.network,
          currency: item?.currency,
          amount: Number(value),
        });
        setquantity(data?.data?.quantity?.toString());
      }
      console.log(data?.data, 'response');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = async e => {
    setquantity(e);
    setTimeout(() => {
      handleQuantity(e);
    }, 2000);
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle leftIcon={SVGLeftArrow} />
      <FullScreenModal
        isVisible={isVisibleBank}
        sendAmount={amount}
        onClose={() => setisVisibleBank(false)}
        onCancel={e => {
          setbankSelected(e);
          setisVisibleBank(false);
          handleSubmit();
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <SvgXml xml={SVGTextImage} />
          <View style={{marginLeft: 8}}>
            <Text
              style={{color: 'black', fontFamily: Fonts.bold, fontSize: 18}}>
              {item?.network?.toUpperCase()}, {item?.currency?.toUpperCase()}
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
            fontFamily: Fonts.regular,
            fontSize: 14,
          }}>
          Depth
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
        }}>
        <View style={{width: '48%'}}>
          <Text
            style={{
              color: 'rgba(106, 106, 106, 1)',
              fontFamily: Fonts.semibold,
              fontSize: 12,
              marginBottom: 8,
            }}>
            Quantity
          </Text>
          <TextInput
            value={quantity}
            onChangeText={value => handleQuantityChange(value, 'quantity')}
            placeholder="0"
            placeholderTextColor={'rgba(106, 106, 106, 1)'}
            style={{
              backgroundColor: 'rgba(226, 241, 227, 1)',
              borderRadius: 12,
              height: 50,
              color: 'black',
              fontFamily: Fonts.semibold,
            }}
          />
        </View>

        <View style={{width: '48%'}}>
          <Text
            style={{
              color: 'rgba(106, 106, 106, 1)',
              fontFamily: Fonts.semibold,
              fontSize: 12,
              marginBottom: 8,
            }}>
            Amount
          </Text>
          <TextInput
            placeholder="Enter Amount"
            value={amount}
            onChangeText={value => handleQuantityChange(value, 'amount')}
            placeholderTextColor={'rgba(106, 106, 106, 1)'}
            style={{
              backgroundColor: 'rgba(226, 241, 227, 1)',
              borderRadius: 12,
              height: 50,
              color: 'black',
              fontFamily: Fonts.semibold,
            }}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 7,

          marginVertical: 12,
        }}>
        <TouchableOpacity
          onPress={() => setselectedFilter('12hour')}
          style={{
            backgroundColor:
              selectedFilter === '12hour' ? '#000' : 'rgba(226, 241, 227, 0.5)',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: '22%',
            marginLeft: 10,
          }}>
          <Text
            style={{
              color:
                selectedFilter === '12hour' ? '#fff' : 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.semibold,
              textAlign: 'center',
              fontSize: 10,
            }}>
            Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter('oneDay')}
          style={{
            backgroundColor:
              selectedFilter === 'oneDay' ? '#000' : 'rgba(226, 241, 227, 1)',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: '22%',
            marginLeft: 10,
          }}>
          <Text
            style={{
              color:
                selectedFilter === 'oneDay' ? '#fff' : 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.semibold,
              textAlign: 'center',
              fontSize: 10,
            }}>
            Limit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter('oneWeek')}
          style={{
            backgroundColor:
              selectedFilter === 'oneWeek' ? '#000' : 'rgba(226, 241, 227, 1)',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: '22%',
            marginLeft: 10,
          }}>
          <Text
            style={{
              color:
                selectedFilter === 'oneWeek' ? '#fff' : 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.semibold,
              textAlign: 'center',
              fontSize: 10,
            }}>
            SL Lmt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter('oneMonth')}
          style={{
            backgroundColor:
              selectedFilter === 'oneMonth' ? '#000' : 'rgba(226, 241, 227, 1)',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: '22%',
            marginLeft: 10,
          }}>
          <Text
            style={{
              color:
                selectedFilter === 'oneMonth' ? '#fff' : 'rgba(44, 106, 63, 1)',
              fontFamily: Fonts.semibold,
              textAlign: 'center',
              fontSize: 10,
            }}>
            Mkt Lmt
          </Text>
        </TouchableOpacity>
      </View>

      <GenericButton
        onPress={handleSubmit}
        title="Sell"
        cStyle={{
          backgroundColor: 'red',
          width: '90%',
          alignSelf: 'center',
          marginTop: 40,
        }}
      />
    </CommonHeaderv2>
  );
}
