import React from 'react';
import {Platform, SafeAreaView, StatusBar, View} from 'react-native';

export default function Container({translucent, children, bgColor, isWhite}) {
  return (
    <>
      {Platform.OS === 'ios' ? (
        <SafeAreaView
          style={{
            flex: 0,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            backgroundColor: !bgColor ? '#fff' : bgColor,
          }}
        />
      ) : null}

      <StatusBar
        animated={true}
        barStyle={isWhite ? 'light-content' : 'dark-content'}
        backgroundColor={'rgba(243, 251, 244, 1)'}
        translucent={translucent ? false : true}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(243, 251, 244, 1)',
        }}>
        {children}
      </View>
    </>
  );
}
