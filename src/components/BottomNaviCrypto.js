import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {SvgXml} from 'react-native-svg';
import {
  SVGCryptoActive,
  SVGHomeActive,
  SVGHomeInctive,
  SVGOffer,
  SVGOfferInactive,
  SVGPortfolioInActive,
  SVGReward,
  SVGScan,
  SVGSetting,
  SVGSettingIncative,
  SVGStocks,
  SVGTransaction,
  SVGTransactionInactive,
} from '../constants/images';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../constants/SCREENS';
import useSelectorAction from '../hooks/useSelectorAction';
import useDispatchAction from '../hooks/useDispatchAction';
import {
  setActiveTab,
  setActiveTabCrypto,
} from '../redux/slices/authenticationSlice';
import {useSelector} from 'react-redux';
import Fonts from '../constants/Fonts';
import {askCameraPremission, checkCameraPremission} from '../helper/Permission';

export default function BottomNaviCrypto({isVer}) {
  const navigation = useNavigation();
  const {activeTabCrypto, pendingRequest} = useSelector(
    state => state.authenticationSlice,
  );
  console.log(activeTabCrypto);

  const handleTabSwitch = name => {
    let activeTabs = 1;
    switch (name) {
      case 'CryptoDashboard':
        activeTabs = 1;
        break;
      case 'CryptoScreen':
        activeTabs = 2;
        break;
      case 'StocksScreen':
        activeTabs = 3;
        break;
    }
    useDispatchAction(setActiveTabCrypto(activeTabs.toString()));

    if (name === 'Scans') {
      checkCam(name);
      return;
    }
    navigation.navigate(name);
  };

  return (
    <View
      style={
        !isVer
          ? {
              padding: 15,
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
        <TouchableOpacity onPress={() => handleTabSwitch('CryptoDashboard')}>
          <SvgXml
            xml={SVGPortfolioInActive}
            style={{opacity: activeTabCrypto === '1' ? 1 : 0.6}}
          />
        </TouchableOpacity>

        {/* Transaction Tab */}
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(44, 106, 63, 1)',
            paddingVertical: 10,
            borderRadius: 20,
            paddingHorizontal: 20,
          }}
          // disabled={true}
          onPress={() => handleTabSwitch('CryptoScreen')}>
          <SvgXml xml={SVGCryptoActive} />
        </TouchableOpacity>

        {/* Offer Tab */}
        <TouchableOpacity
          // disabled={true}
          onPress={() => handleTabSwitch('StocksScreen')}>
          <SvgXml
            xml={SVGStocks}
            style={{opacity: activeTabCrypto === '3' ? 1 : 0.6}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
