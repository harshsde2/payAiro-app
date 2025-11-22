import React, { useState } from 'react';
import { View, TextInput as RNTextInput, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@styles/ThemeContext';
import CustomText from '@components/common-components/CustomText';
import { ITextInputProps } from './types';

const TextInput: React.FC<ITextInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  height = 46,
  width = '100%',
  borderRadius = 8,
  borderWidth = 1,
  borderColor,
  showLeftSeparator = true,
  showRightSeparator = true,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const defaultBorderColor = borderColor || theme.colors.grey;
  const finalBorderColor = isFocused ? theme.colors.primary : defaultBorderColor;

  const inputContainerStyle: ViewStyle = {
    height,
    width,
    borderRadius,
    borderWidth,
    borderColor: finalBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 0,
  };

  const leftIconContainerStyle: ViewStyle = {
    paddingLeft: 16,
    paddingRight: leftIcon && showLeftSeparator ? 12 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const leftSeparatorStyle: ViewStyle = {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.grey,
    marginRight: 12,
  };

  const rightSeparatorStyle: ViewStyle = {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.grey,
    marginLeft: 12,
  };

  const inputWrapperStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  };

  const rightIconContainerStyle: ViewStyle = {
    paddingRight: 16,
    paddingLeft: rightIcon && showRightSeparator ? 12 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const textInputStyle: ViewStyle = {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    paddingVertical: 0,
    paddingHorizontal: leftIcon || rightIcon ? 0 : 16,
  };

  return (
    <View style={containerStyle}>
      {label && (
        <CustomText
          variant="label"
          fontWeight="medium"
          style={[
            {
              marginBottom: 8,
              color: theme.colors.text,
            },
            labelStyle,
          ]}
        >
          {label}
        </CustomText>
      )}
      <View style={inputContainerStyle}>
        {leftIcon && (
          <>
            <TouchableOpacity
              onPress={onLeftIconPress}
              disabled={!onLeftIconPress}
              activeOpacity={onLeftIconPress ? 0.7 : 1}
              style={leftIconContainerStyle}
            >
              {leftIcon}
            </TouchableOpacity>
            {showLeftSeparator && <View style={leftSeparatorStyle} />}
          </>
        )}
        <View style={inputWrapperStyle}>
          <RNTextInput
            style={[textInputStyle, inputStyle, style]}
            placeholderTextColor={theme.colors.grey}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </View>
        {rightIcon && (
          <>
            {showRightSeparator && <View style={rightSeparatorStyle} />}
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              activeOpacity={onRightIconPress ? 0.7 : 1}
              style={rightIconContainerStyle}
            >
              {rightIcon}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default TextInput;

