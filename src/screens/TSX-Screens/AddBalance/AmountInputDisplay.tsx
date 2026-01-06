import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import React, { FC, useRef, useState, useMemo, useEffect } from "react";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { setErrorMsg } from "redux/slices/authenticationSlice";
import { useDispatch } from "react-redux";
import { SvgIcons } from "constants/svgs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AmountInputDisplayProps {
  amount: string;
  setAmount: (test: string) => void;
  showDollarIcon?: boolean;
  suffixText?: string;
  maxLimit?: number;
  onCurrencySelector?: () => void;
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
  hasError?: boolean;
}

const MAX_FONT_SIZE = 48;
const MIN_FONT_SIZE = 24;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AmountInputDisplay: FC<AmountInputDisplayProps> = ({
  amount,
  setAmount,
  showDollarIcon = true,
  suffixText,
  maxLimit = 100000,
  selectedCurrency = "USD",
  onCurrencyChange,
  hasError = false,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Animation values for shake effect
  const translateX = useSharedValue(0);
  const borderColor = useSharedValue("transparent");
  const borderWidth = useSharedValue(0);

  // Trigger shake animation when error occurs
  useEffect(() => {
    if (hasError) {
      // Shake animation: left-right-left-right
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      
      // Change border color to red and make it visible
      borderColor.value = withTiming(theme.colors.palette.red500, { duration: 200 });
      borderWidth.value = withTiming(2, { duration: 200 });
      
      // Reset border color after animation
      setTimeout(() => {
        borderColor.value = withTiming("transparent", { duration: 300 });
        borderWidth.value = withTiming(0, { duration: 300 });
      }, 1000);
    }
  }, [hasError, theme.colors.palette.red500]);

  // Reset error state when amount changes
  useEffect(() => {
    if (amount && amount.length > 0 && !hasError) {
      borderColor.value = withTiming("transparent", { duration: 200 });
      borderWidth.value = withTiming(0, { duration: 200 });
    }
  }, [amount, hasError]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      borderColor: borderColor.value,
      borderWidth: borderWidth.value,
    };
  });

  const dynamicFontSize = useMemo(() => {
    const displayPrefix = selectedCurrency === "USD" && showDollarIcon;
    const displaySuffix = selectedCurrency !== "USD" && suffixText;
    
    // Calculate total character count including prefix/suffix
    let totalChars = amount.length || 3; // Default "0.00" is 4 chars
    if (displayPrefix) totalChars += 1; // $ sign
    if (displaySuffix && amount.length > 0) totalChars += (suffixText?.length || 0);
    if (selectedCurrency === "USD" && suffixText && amount.length > 0) totalChars += 4; // "USD" text
    
    // Available width for the amount display (with padding)
    const availableWidth = SCREEN_WIDTH - 80;
    
    // Estimate character width ratio (bold font is wider)
    const charWidthRatio = 0.6;
    
    // Calculate the ideal font size based on content
    const idealFontSize = availableWidth / (totalChars * charWidthRatio);
    
    // Clamp between min and max
    const clampedSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, idealFontSize));
    
    return Math.floor(clampedSize);
  }, [amount, selectedCurrency, showDollarIcon, suffixText]);

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
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.spacing.spacing[2] || 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 60,
          },
          // animatedContainerStyle,
        ]}
      >
        {displayPrefix && (
          <Text
            style={{
              fontSize: dynamicFontSize,
              fontWeight: "bold",
              color: theme.colors.palette.grey900,
              includeFontPadding: false,
              textAlignVertical: "center",
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
            fontSize: dynamicFontSize,
            fontWeight: "bold",
            color: theme.colors.palette.black,
            minWidth: 0,
            includeFontPadding: false,
            textAlignVertical: "center",
            padding: 0,
            margin: 0,
          }}
          placeholder="0.00"
          placeholderTextColor={theme.colors.palette.grey400}
          textAlign="left"
          caretHidden={!isFocused}
          onBlur={() => setIsFocused(false)}
        />
        {amount.length > 0 && displaySuffix && (
          <TouchableOpacity
            onPress={handleCurrencyToggle}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 8,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: theme.colors.palette.grey900,
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {suffixText}
            </Text>
            <SvgIcons.ChevronDown />
          </TouchableOpacity>
        )}
        {amount.length > 0 && selectedCurrency === "USD" && suffixText && (
          <TouchableOpacity
            onPress={handleCurrencyToggle}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 8,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: theme.colors.palette.grey600,
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              USD
            </Text>
            <SvgIcons.ChevronDown />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AmountInputDisplay;