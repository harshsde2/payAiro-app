import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {
  SVGHomeActive,
  SVGHomeInctive,
  SVGOffer,
  SVGOfferInactive,
  SVGReward,
  SVGScan,
  SVGSetting,
  SVGSettingIncative,
  SVGTransaction,
  SVGTransactionInactive,
} from '../constants/images';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/SCREENS';
import useSelectorAction from '../hooks/useSelectorAction';
import useDispatchAction from '../hooks/useDispatchAction';
import {setActiveTab} from '../redux/slices/authenticationSlice';
import {useSelector} from 'react-redux';
import Fonts from '../constants/Fonts';
import {askCameraPremission, checkCameraPremission} from '../helper/Permission';

export default function BottomNavigation({isVer}) {
  const navigation = useNavigation();
  const {activeTab, pendingRequest} = useSelector(
    state => state.authenticationSlice,
  );
  console.log(activeTab);

  const handleTabSwitch = name => {
    let activeTabs = 1;
    switch (name) {
      case 'Dashboard':
        activeTabs = 1;
        break;
      case 'Transaction':
        activeTabs = 2;
        break;
      case 'Scans':
        activeTabs = 3;
        break;
      case 'Rewards':
        activeTabs = 4;
        break;
      case 'SettingScreen':
        activeTabs = 5;
        break;
    }
    useDispatchAction(setActiveTab(activeTabs.toString()));

    if (name === 'Scans') {
      checkCam(name);
      return;
    }
    navigation.navigate(name);
  };
  const checkCam = name => {
    checkCameraPremission()
      .then(res => {
        if (res) {
          navigation.navigate(name);
        } else {
          askCameraPremission()
            .then(res => {
              console.log(res, 'res');
              if (res) {
                navigation.navigate(name);
              }
            })
            .catch(() => {
              navigation.navigate(name);
            });
        }
      })
      .catch(() => {
        navigation.navigate(name);
      });
  };
  return (
    <View
      style={
        !isVer
          ? {
              padding: 10,
              backgroundColor: 'black',
              borderRadius: 20,
              position: 'absolute',
              bottom: 20,
              zIndex: 9999,
              width: '92%',
              alignSelf: 'center',
            }
          : {}
      }>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        {/* Dashboard Tab */}
        <TouchableOpacity onPress={() => handleTabSwitch('Dashboard')}>
          <SvgXml
            xml={SVGHomeInctive}
            style={{opacity: activeTab === '1' ? 1 : 0.6}}
          />
        </TouchableOpacity>

        {/* Transaction Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => handleTabSwitch(SCREENS.Transaction)}>
          <SvgXml
            xml={SVGTransactionInactive}
            style={{opacity: activeTab === '2' ? 1 : 0.6}}
          />
          {pendingRequest && pendingRequest > 0 ? (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 35,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: 'red',
                position: 'absolute',
                bottom: 10,
                right: -10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: Fonts.semibold,
                  textAlign: 'center',
                  fontSize: 12,
                  // paddingBottom: 5,
                }}>
                {pendingRequest}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Scan Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => handleTabSwitch(SCREENS.Scans)}>
          <SvgXml
            xml={SVGScan}
            // style={{opacity: activeTab === '3' ? 1 : 0.6}}
          />
        </TouchableOpacity>

        {/* Offer Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => handleTabSwitch('Rewards')}>
          <SvgXml
            xml={SVGOffer}
            style={{opacity: activeTab === '4' ? 1 : 0.6}}
          />
        </TouchableOpacity>

        {/* Setting Tab */}
        <TouchableOpacity onPress={() => handleTabSwitch('SettingScreen')}>
          <SvgXml
            xml={SVGSettingIncative}
            style={{opacity: activeTab === '5' ? 1 : 0.6}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
