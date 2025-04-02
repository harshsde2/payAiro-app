import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGDate, SVGLeftArrow, SVGOr} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';
import {SvgXml} from 'react-native-svg';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';
import {getStatementsTX} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';

export default function Statement() {
  const {tokens} = useSelectorAction();
  const [selectedTime, setselectedTime] = useState('week');
  const [date, setdate] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedType, setselectedType] = useState('all');

  const [date2, setdate2] = useState('');
  const [open2, setOpen2] = useState(false);
  const [tx, settx] = useState([]);

  const navigation = useNavigation();
  // useEffect(() => {
  //   handleTX();
  // }, []);

  const handleTX = async () => {
    const filter = `date_period=${selectedTime}&start_date=${date}&end_date=${date2}&transaction_type=${selectedType}`;
    const data = await getStatementsTX(filter, tokens?.access);
    console.log(data?.data?.transactions, 'getStatementsTX!!');
    settx(data?.data?.transaction);
    navigation.navigate('StatementDetails', {
      data: data?.data?.transactions,
    });
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Statement Details'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 10,
        }}>
        <Text style={{color: 'black', fontFamily: Fonts.bold, fontSize: 22}}>
          Transaction Duration
        </Text>
        <DatePicker
          modal
          mode="date"
          open={open}
          date={new Date()}
          onConfirm={date => {
            setOpen(false);
            setdate(moment(date).format('YYYY-MM-DD'));
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
        <DatePicker
          modal
          mode="date"
          open={open2}
          date={new Date()}
          onConfirm={date => {
            setOpen2(false);
            setdate2(moment(date2).format('YYYY-MM-DD'));
          }}
          onCancel={() => {
            setOpen2(false);
          }}
        />
        <TextInputField
          lStyle={{fontSize: 12, fontFamily: Fonts.semibold}}
          label={'Select Number of Recent Transactions'}
          cStyle={{marginTop: 17, backgroundColor: 'rgba(217, 217, 217, 0.07)'}}
        />

        <SvgXml xml={SVGOr} style={{marginVertical: 30, alignSelf: 'center'}} />

        <Text style={{fontFamily: Fonts.bold, padding: 10}}>
          Select Predefined Period
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 5,
          }}>
          <TouchableOpacity
            onPress={() => setselectedTime('week')}
            style={{
              paddingHorizontal: 15,
              borderRadius: 30,
              backgroundColor:
                selectedTime === 'week' ? '#000' : 'rgba(43, 43, 43, 0.4)',

              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              Last Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setselectedTime('month')}
            style={{
              paddingHorizontal: 15,
              borderRadius: 30,
              backgroundColor:
                selectedTime === 'month' ? '#000' : 'rgba(43, 43, 43, 0.4)',

              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              Last Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setselectedTime('3month')}
            style={{
              paddingHorizontal: 15,
              borderRadius: 30,
              backgroundColor:
                selectedTime === '3month' ? '#000' : 'rgba(43, 43, 43, 0.4)',
              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              Last 3 Month
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{fontFamily: Fonts.bold, padding: 10, marginTop: 20}}>
          Select Predefined Period
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={{width: '48%'}}>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                padding: 10,

                color: 'rgba(29, 29, 29, 1)',
              }}>
              Start Date
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(106, 106, 106, 0.08)',
                paddingHorizontal: 15,
                paddingBottom: 15,
                paddingTop: 12,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderRadius: 30,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  color: 'rgba(29, 29, 29, 1)',
                }}>
                {date === ''
                  ? ' MM/DD/YY'
                  : moment(date ?? new Date()).format('MM/DD/YY')}{' '}
              </Text>
              <SvgXml
                xml={SVGDate}
                style={{position: 'absolute', right: 15, top: 15}}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOpen2(true)}
            style={{width: '48%'}}>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                padding: 10,

                color: 'rgba(29, 29, 29, 1)',
              }}>
              End Date
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(106, 106, 106, 0.08)',
                paddingHorizontal: 15,
                paddingBottom: 15,
                paddingTop: 12,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                borderRadius: 30,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  color: 'rgba(29, 29, 29, 1)',
                }}>
                {date2 === ''
                  ? ' MM/DD/YY'
                  : moment(date2 ?? new Date()).format('MM/DD/YY')}
              </Text>
              <SvgXml
                xml={SVGDate}
                style={{position: 'absolute', right: 15, top: 15}}
              />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={{fontFamily: Fonts.bold, padding: 10, marginTop: 20}}>
          Select Transaction Type
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: 5,
          }}>
          <TouchableOpacity
            onPress={() => setselectedType('all')}
            style={{
              paddingHorizontal: 15,
              marginLeft: 10,
              borderRadius: 30,
              backgroundColor:
                selectedType === 'all' ? '#000' : 'rgba(43, 43, 43, 0.4)',

              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setselectedType('debit')}
            style={{
              paddingHorizontal: 15,
              marginLeft: 10,
              borderRadius: 30,
              backgroundColor:
                selectedType === 'debit' ? '#000' : 'rgba(43, 43, 43, 0.4)',

              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              Debit Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setselectedType('credit')}
            style={{
              paddingHorizontal: 15,
              marginLeft: 10,
              borderRadius: 30,
              backgroundColor:
                selectedType === 'credit' ? '#000' : 'rgba(43, 43, 43, 0.4)',
              paddingTop: 10,
              paddingBottom: 13,
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: Fonts.semibold,
                fontSize: 14,
              }}>
              Credit Card
            </Text>
          </TouchableOpacity>
        </View>

        <GenericButton
          title={'View Statement'}
          cStyle={{marginTop: 30}}
          onPress={() => handleTX()}
        />
      </View>
    </CommonHeaderv2>
  );
}
