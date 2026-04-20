import React from 'react';
import { View, Platform, TextInputProps } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';
import { TextInput } from '../layout';
import { AppIcon } from 'new-ui/assets/svgs';

type AddBalanceAmountFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputRef?: React.RefObject<null | undefined>;
} & Pick<TextInputProps, 'editable'>;

const AddBalanceAmountField: React.FC<AddBalanceAmountFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = 'Enter Amount',
  inputRef,
  editable = true,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  return (
    <View>
      <TextInput
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            autoCapitalize="none"
            leftIcon={<CustomText variant='h3' size={15}  fontWeight='medium' color={theme.colors.primary} fontFamily='poppins'>$</CustomText>}
          />
    </View>
  );
};

export default AddBalanceAmountField;
