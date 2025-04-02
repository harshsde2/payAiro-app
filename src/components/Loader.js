import React from 'react';

import {ActivityIndicator, Text, View} from 'react-native';
import Fonts from '../constants/Fonts';

const Loader = ({spin, txt}) => {
  if (spin) {
    return (
      <View
        style={{
          position: 'absolute',
          zIndex: 999999,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <ActivityIndicator size={60} color={'rgba(44, 106, 63, 1)'} />
        {txt ? (
          <Text
            style={{color: '#B1FF84', fontFamily: Fonts.medium, fontSize: 16}}>
            {txt}
          </Text>
        ) : null}
      </View>
    );
  } else {
    return null;
  }
};

export default Loader;
