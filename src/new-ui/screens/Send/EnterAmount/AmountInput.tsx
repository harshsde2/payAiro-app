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
};

const AmountInput: React.FC<AmountInputProps> = ({
  inputValue,
  onChangeAmountText,
  inputRef,
  dynamicFontSize,
  onPressFocus,
  leftPrefix = '$',
  rightSuffix,
}) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPressFocus}>
      <View style={styles.amountRow}>
        <CustomText
          variant="h1"
          fontWeight="semiBold"
          size={dynamicFontSize}
          style={styles.amountCurrency}
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
          ]}
          autoFocus
          returnKeyType="done"
          // Controlled TextInput: keep it single-line for amount entry.
          multiline={false}
        />
        {rightSuffix ? (
          <CustomText
            variant="h1"
            fontWeight="semiBold"
            size={dynamicFontSize}
            style={styles.amountSuffix}
          >
            {rightSuffix}
          </CustomText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default AmountInput;

