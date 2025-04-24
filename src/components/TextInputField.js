import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import Fonts from '../constants/Fonts';
import CountryCodeModal from './CountryCodeModal';
import {CC} from '../constants/countryCode';
import {SvgXml} from 'react-native-svg';
import {SVGProfile3} from '../constants/images';

export default function TextInputField({
  countryCode,
  value,
  onChange,
  placeholder,
  onSelected,
  label,
  cStyle,
  isCountry,
  isIcon,
  isMultiLine,
  icon,
  iStyle,
  editable,
  lStyle,
  keyboardType,
  maxLength,
}) {
  const [isVisible, setisVisible] = useState(false);
  return (
    <>
      {isVisible && (
        <CountryCodeModal
          isVisible={isVisible}
          onClose={() => setisVisible(false)}
          data={CC}
          onSelected={e => {
            onSelected(e);
            setisVisible(false);
          }}
        />
      )}
      <View style={{...cStyle}}>
        <Text style={{fontFamily: Fonts.semibold, padding: 10, ...lStyle}}>
          {label}{' '}
        </Text>
        <View
          style={{
            borderRadius: 30,
            borderWidth: 1,
            borderColor: '#6A6A6A33',
            flexDirection: 'row',
            justifyContent: isCountry ? 'space-between' : 'flex-start',
            alignItems: 'center',
            paddingVertical: !countryCode ? 5 : 0,
            ...iStyle,
          }}>
          {countryCode && (
            <TouchableOpacity
              disabled={editable}
              onPress={() => setisVisible(true)}
              style={{
                borderRightColor: '#6A6A6A33',
                borderRightWidth: isCountry ? 0 : 1,
                width: isCountry ? '100%' : '20%',
                paddingHorizontal: 10,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: isCountry ? 12 : 12,
                  marginRight: 5,
                }}>
                {isCountry ? countryCode?.country : countryCode?.code}
              </Text>
              <Image
                source={{
                  uri: countryCode?.flag_image_url,
                }}
                style={{width: 30, height: 18, alignSelf: 'flex-end'}}
              />
            </TouchableOpacity>
          )}
          {isIcon && (
            <SvgXml
              xml={icon ?? SVGProfile3}
              style={{position: 'absolute', right: 10}}
            />
          )}

          {!isCountry && !isMultiLine && (
            <TextInput
              maxLength={maxLength}
              editable={editable}
              style={{
                color: '#000',
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                width: '90%',
              }}
              placeholder={placeholder}
              placeholderTextColor={'#6A6A6A'}
              onChangeText={onChange}
              value={value}
              keyboardType={keyboardType ?? 'default'}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {isMultiLine && (
            <TextInput
              style={{
                color: '#000',
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                height: 100,
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
              }}
              placeholder={placeholder}
              placeholderTextColor={'#6A6A6A'}
              onChangeText={onChange}
              value={value}
              multiline={true}
            />
          )}
        </View>
      </View>
    </>
  );
}
