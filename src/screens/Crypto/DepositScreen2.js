import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useRef, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {
  SVGCopied,
  SVGLeftArrow,
  SVGSearch,
  SVGSwaps,
} from '../../constants/images';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import {DEPOSIT_INFO} from '../../constants/mockData';
import GenericButton from '../../components/GenericButton';
import DepositModal from '../../components/DepositModal';

export default function DepositScreen2(props) {
  const {item, address} = props.route.params;
  const viewShotRef = useRef(null);
  const [isVisible, setisVisible] = useState(false);
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        title={`Deposit ${item?.blockchain} (${item?.tokens[0]?.symbol})`}
        leftIcon={SVGLeftArrow}
        rightIcon={SVGSearch}
      />
      <DepositModal
        isVisible={isVisible}
        onCancel={() => setisVisible(false)}
        onClose={() => setisVisible(false)}
      />
      <View
        style={{
          alignSelf: 'center',
          marginTop: 80,
          backgroundColor: 'rgba(245, 245, 245, 1)',
          padding: 20,
          borderRadius: 20,
        }}>
        <ViewShot ref={viewShotRef} options={{format: 'png', quality: 0.9}}>
          <QRCode value={address} size={200} />
        </ViewShot>
      </View>
      <View style={{margin: 20}}>
        <Text
          style={{
            color: 'rgba(106, 106, 106, 1)',
            fontSize: 12,
            fontFamily: Fonts.semibold,
            marginTop: 30,
          }}>
          Network
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: Fonts.regular,
              fontSize: 18,
            }}>{`${item?.blockchain} (${item?.tokens[0]?.symbol})`}</Text>
          <SvgXml xml={SVGSwaps} />
        </View>
        <Text
          style={{
            color: 'rgba(106, 106, 106, 1)',
            fontSize: 12,
            fontFamily: Fonts.semibold,
            marginTop: 30,
          }}>
          Deposit Address
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: Fonts.regular,
              fontSize: 16,
              width: '60%',
            }}>
            {address}
          </Text>
          <SvgXml xml={SVGCopied} />
        </View>
        <View style={{marginVertical: 15}}>
          {DEPOSIT_INFO.map((item, k) => (
            <View style={styles.itemContainer}>
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => setisVisible(true)}>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              marginBottom: 10,
              fontSize: 12,
              color: 'rgba(106, 106, 106, 1)',
            }}>
            {'More Details'}
          </Text>
        </TouchableOpacity>
        <GenericButton title={'Save and Share Address'} />
      </View>
    </CommonHeaderv2>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: 'rgba(106, 106, 106, 1)',
  },
  value: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.semibold,
  },
});
