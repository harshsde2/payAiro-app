import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { pinInputStyles } from '@new-ui/styles/components/pinInputStyles';
import { IPinInputProps } from './types';

export const PIN_LENGTH = 4;

/**
 * The 4-digit transaction PIN entry, masked. Wraps the same OtpInput the OTP screens
 * use so PIN and OTP fields stay visually consistent and there's no second keypad
 * implementation to maintain (AppLockScreen's hand-rolled one is old-UI and coupled
 * to the lock modal).
 */
const PinInput = forwardRef<OtpInputRef, IPinInputProps>(
  ({ onTextChange, onFilled, disabled = false, autoFocus = false, hasError = false, style }, ref) => {
    const { theme } = useTheme();
    const styles = pinInputStyles(theme);
    // OtpInput's theme keys take a single ViewStyle, not RN's usual style array.
    const boxStyle = hasError
      ? StyleSheet.flatten([styles.input, styles.inputError])
      : styles.input;
    const filledBoxStyle = hasError
      ? StyleSheet.flatten([styles.inputFilled, styles.inputError])
      : styles.inputFilled;

    return (
      <View style={[styles.container, style]}>
        <OtpInput
          ref={ref}
          numberOfDigits={PIN_LENGTH}
          secureTextEntry
          autoFocus={autoFocus}
          disabled={disabled}
          type="numeric"
          blurOnFilled
          focusColor={theme.colors.primary}
          onTextChange={onTextChange}
          onFilled={onFilled}
          textInputProps={{
            accessibilityLabel: 'PIN',
            // Never offer to save a transaction PIN to the OS password manager.
            textContentType: 'none',
            autoComplete: 'off',
          }}
          theme={{
            containerStyle: styles.inputContainer,
            pinCodeContainerStyle: boxStyle,
            pinCodeTextStyle: styles.inputText,
            focusedPinCodeContainerStyle: styles.inputActive,
            filledPinCodeContainerStyle: filledBoxStyle,
            disabledPinCodeContainerStyle: styles.inputDisabled,
          }}
        />
      </View>
    );
  }
);

PinInput.displayName = 'PinInput';

export default PinInput;
