import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import React, { FC, useRef, useState } from "react";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { setErrorMsg } from "redux/slices/authenticationSlice";
import { useDispatch } from "react-redux";
import { SvgIcons } from "constants/svgs";

interface AmountInputDisplayProps {
  amount: string;
  setAmount: (test: string) => void;
  showDollarIcon?: boolean;
  suffixText?: string;
  maxLimit?: number;
  onCurrencySelector?: () => void;
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const AmountInputDisplay: FC<AmountInputDisplayProps> = ({
  amount,
  setAmount,
  showDollarIcon = true,
  suffixText,
  maxLimit = 100000,
  selectedCurrency = "USD",
  onCurrencyChange,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > maxLimit) {
      dispatch(
        setErrorMsg(`Amount cannot exceed ${maxLimit.toLocaleString()}`)
      );
      return;
    }
    setAmount(value);
  };

  const handleCurrencyToggle = () => {
    if (onCurrencyChange) {
      const newCurrency = selectedCurrency === "USD" ? suffixText?.trim() || "" : "USD";
      onCurrencyChange(newCurrency);
    }
  };

  const displayPrefix = selectedCurrency === "USD" && showDollarIcon;
  const displaySuffix = selectedCurrency !== "USD" && suffixText;

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
        }}
      >
        {displayPrefix && (
          <Text
            style={{
              fontSize: 48,
              fontWeight: "bold",
              color: theme.colors.palette.grey900,
              // position:'absolute'
              lineHeight:Platform.OS == 'ios' ? 50 : 85
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
        {amount.length > 0 && displaySuffix && (
          <View>
            <TouchableOpacity
              onPress={handleCurrencyToggle}
              style={{
                alignItems: "center",
                flexDirection: "row",
                marginBottom: 10,
                gap: 10,
                marginLeft: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: theme.colors.palette.grey900,
                }}
              >
                {suffixText}
              </Text>
              <SvgIcons.ChevronDown style={{}} />
            </TouchableOpacity>
          </View>
        )}
        {amount.length > 0 && selectedCurrency === "USD" && suffixText && (
          <TouchableOpacity
            onPress={handleCurrencyToggle}
            style={{
              marginBottom: 10,
              marginLeft: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.colors.palette.grey600,
              }}
            >
              USD
            </Text>
            <SvgIcons.ChevronDown style={{}} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AmountInputDisplay;