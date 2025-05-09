import {View, Text, TouchableOpacity, StyleSheet, Platform, TextStyle} from 'react-native';
import React, { FC } from 'react';
import Fonts from '../constants/Fonts';
import {SvgXml} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../styles/ThemeContext';
import { Theme } from 'styles';

interface HeaderTitleProps {
  title: string;
  leftIcon: string;
  rightIcon?: string;
  isBack?: boolean;
  onPressLeft: () => void;
  onPressRight?: () => void; // <-- optional
  titleStyle?: TextStyle;    // <-- optional
}

const HeaderTitle: FC<HeaderTitleProps> = ({
  title,
  leftIcon,
  rightIcon,
  isBack = true,
  onPressLeft,
  onPressRight,
  titleStyle,
}) =>{
  const navigation = useNavigation();
  const {theme} = useTheme();
  
  // Default handlers
  const handleLeftPress = () => {
    if (onPressLeft) {
      onPressLeft();
    } else if (isBack) {
      navigation.goBack();
    }
  };
  
  const handleRightPress = () => {
    if (onPressRight) {
      onPressRight();
    } else if (isBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles(theme).headerContainer}>
      <View style={styles(theme).headerContent}>
        {leftIcon ? (
          <TouchableOpacity
            style={styles(theme).leftButton}
            onPress={handleLeftPress}
            accessibilityRole="button"
            accessibilityLabel="Back button">
            <SvgXml width={60} height={60} xml={leftIcon} />
          </TouchableOpacity>
        ) : (
          <View style={styles(theme).spacer} />
        )}
        
        <Text
          style={[styles(theme).title, titleStyle]}
          numberOfLines={1}
          accessibilityRole="header">
          {title}
        </Text>
        
        {rightIcon ? (
          <TouchableOpacity
            style={styles(theme).rightButton}
            onPress={handleRightPress}
            accessibilityRole="button">
            <SvgXml xml={rightIcon} width={40} height={40} />
          </TouchableOpacity>
        ) : (
          <View style={styles(theme).spacer} />
        )}
      </View>
    </View>
  );
}
export default HeaderTitle

const styles = (theme : Theme) => StyleSheet.create({
  headerContainer: {
    // paddingTop: Platform.OS === 'ios' ? 60 : 30,
    // paddingBottom: 5,
    backgroundColor: 'transparent',
    width: '100%',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor:'red',
    // paddingHorizontal: theme?.spacing?.layout?.screenPadding || 16,
    minHeight: 60,
  },
  leftButton: {
    width: '20%',
    paddingVertical: 8,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  rightButton: {
    width: '20%',
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    minHeight: 60,
  },
  spacer: {
    width: '20%',
  },
  title: {
    flex: 1,
    fontFamily: Fonts.semibold,
    color: theme?.colors?.text?.primary || '#000',
    fontSize: 18,
    textAlign: 'center',
  },
});
