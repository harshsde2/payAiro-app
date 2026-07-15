import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';

type AmountInputProps = {
  inputValue: string;
  onChangeAmountText: (text: string) => void;
  inputRef: React.RefObject<RNTextInput | null>;
  dynamicFontSize: number;
  onPressFocus: () => void;
  leftPrefix?: string;
  rightSuffix?: string;
  editable?: boolean;
};

const AmountInput: React.FC<AmountInputProps> = ({
  inputValue,
  onChangeAmountText,
  inputRef,
  dynamicFontSize,
  onPressFocus,
  leftPrefix = '$',
  rightSuffix,
  editable = true,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!editable}
      onPress={editable ? onPressFocus : undefined}
    >
      <View style={styles.amountRow}>
        <CustomText
          variant="h1"
          fontWeight="semiBold"
          size={dynamicFontSize}
          style={[
            styles.amountCurrency,
            // Match the TextInput's explicit lineHeight below so both sit in
            // identically-sized line boxes — otherwise `flex-end` aligns their
            // bottoms to slightly different points on Android.
            Platform.OS === 'android' ? { lineHeight: dynamicFontSize * 1.2 } : null,
          ]}
        >
          {leftPrefix}
        </CustomText>
        <RNTextInput
          ref={inputRef}
          value={inputValue}
          onChangeText={onChangeAmountText}
          keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          placeholder="0.00"
          placeholderTextColor={theme.colors.greyDark}
          style={[
            styles.amountInput,
            {
              fontSize: dynamicFontSize,
              fontFamily: theme.typography.fontFamily.semiBold,
              color: theme.colors.text,
            },
            // Android's TextInput reserves extra vertical space around the glyphs
            // (includeFontPadding) that a sibling Text doesn't have, and computes its
            // own default line-height independently of Text — both push the digits out
            // of baseline alignment with the "$" prefix in this flex-end row. Pinning an
            // explicit, identical lineHeight on both elements makes their line boxes the
            // same height so flex-end lines up their bottoms exactly. None of this
            // applies on iOS (props are no-ops there / already aligned).
            Platform.OS === 'android'
              ? {
                  includeFontPadding: false,
                  textAlignVertical: 'center' as const,
                  lineHeight: dynamicFontSize * 1.2,
                }
              : null,
          ]}
          autoFocus
          returnKeyType="done"
          // Controlled TextInput: keep it single-line for amount entry.
          multiline={false}
          editable={editable}
        />
        {rightSuffix ? (
          <CustomText
            variant="h1"
            fontWeight="semiBold"
            size={dynamicFontSize}
            style={[
              styles.amountSuffix,
              // Same fix as the "$" prefix — match the TextInput's explicit lineHeight.
              Platform.OS === 'android' ? { lineHeight: dynamicFontSize * 1.2 } : null,
            ]}
          >
            {rightSuffix}
          </CustomText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default AmountInput;

