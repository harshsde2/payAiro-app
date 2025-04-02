import React, {useState, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';

const WalletSwitch = ({
  walletData,
  balance,
  navigation,
  Fonts,
  SVGLogo2,
  SCREENS,
}) => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Handle the toggle switch
  const toggleSwitch = () => {
    setIsSwitchOn(!isSwitchOn);
    Animated.timing(animation, {
      toValue: isSwitchOn ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Interpolating animation for the thumb movement
  const thumbPosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust width of movement based on your View's size
  });

  // Background color animation
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#81b0ff'], // Colors for off and on states
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: backgroundColor}, // Animated background
      ]}
      onTouchEnd={toggleSwitch}>
      <View style={styles.content}>
        <View>
          <Text style={{fontFamily: Fonts.semibold, color: 'black'}}>
            Wallet Address:
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: Fonts.semibold,
              color: 'black',
              fontSize: 12,
              width: '80%',
            }}>
            {walletData?.wallet_public_key}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.semibold,
              color: 'black',
              marginTop: 50,
            }}>
            Payairo Tokens
          </Text>
          <Text
            style={{
              fontFamily: Fonts.bold,
              color: 'black',
              fontSize: 30,
            }}>
            ${Number(balance).toFixed(2)}{' '}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(SCREENS.ScanPay, {
                  type: 'widthdraw',
                })
              }
              style={{
                padding: 5,
                backgroundColor: '#000',
                borderRadius: 20,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: Fonts.semibold,
                  fontSize: 10,
                }}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
        {/* Switch Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {transform: [{translateX: thumbPosition}]}, // Animated thumb position
          ]}>
          <SvgXml xml={SVGLogo2} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 25,
    margin: 15,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
});

export default WalletSwitch;
