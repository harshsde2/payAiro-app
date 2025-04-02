import {View, Text, Touchable, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import {setActiveTab} from '../../redux/slices/authenticationSlice';
import Notificatiom from '../Authentications/Notificatiom';
import {getNotification} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';

export default function Notification() {
  const {tokens} = useSelectorAction();

  const [activeTab, setactiveTab] = useState('1');
  const [notification, setnotification] = useState([]);
  useEffect(() => {
    getNotificationDetails();
  }, []);
  const getNotificationDetails = async () => {
    const data = await getNotification(tokens?.access);
    console.log(data, 'notification');
    setnotification(data?.data);
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Notification'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        <View
          style={{
            padding: 5,
            backgroundColor: 'rgba(226, 241, 227, 1)',
            borderRadius: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
              General
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
              Transaction
            </Text>
          </TouchableOpacity>
        </View>
        {notification &&
          notification?.length > 0 &&
          notification.map((i, k) => <Notificatiom item={i} key={k} />)}
        {/* <View style={{marginVertical: 20}}>
          <Notificatiom />
          <Notificatiom />
          <Notificatiom />
          <Notificatiom />
        </View> */}
      </View>
    </CommonHeaderv2>
  );
}
