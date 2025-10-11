import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { FC, useRef, useState } from "react";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { setErrorMsg } from "redux/slices/authenticationSlice";
import { useDispatch } from "react-redux";

interface AmountInputDisplayProps {
  amount: string;
  setAmount: (test: string) => void;
  showDollarIcon?: boolean;
  suffixText?: string;
  maxLimit?: number;
}
const AmountInputDisplay: FC<AmountInputDisplayProps> = ({
  amount,
  setAmount,
  showDollarIcon = true,
  suffixText,
  maxLimit = 100000,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > maxLimit) {
      dispatch(setErrorMsg(`Amount cannot exceed ₹${maxLimit.toLocaleString()}`));
      return;
    }
    setAmount(value);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }}
      style={{
        alignItems: "center",
        paddingVertical: 20,
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      <CustomText variant="subtitle1" style={{ marginBottom: 5 }}>
        Enter Amount
      </CustomText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          // justifyContent: "center",
          // backgroundColor: "red",
        }}
      >
        {showDollarIcon && (
          <Text
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: theme.colors.palette.grey900,
            }}
          >
            $
          </Text>
        )}
        <TextInput
          ref={inputRef}
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: theme.colors.palette.black,
            minWidth: 0,
          }}
          placeholder="0.00"
          placeholderTextColor={theme.colors.palette.grey400}
          textAlign="left"
          caretHidden={!isFocused}
          onBlur={() => setIsFocused(false)}
        />
        {amount.length > 0 && suffixText && (
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: theme.colors.palette.grey900,
              marginBottom: 10,
            }}
          >
            {suffixText}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AmountInputDisplay;
