import React, { FC, useRef, useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet, ViewStyle } from "react-native";
import Fonts from "../constants/Fonts";
import { CustomText } from "tsx-components";
import { useTheme } from "styles";
import { detectInputIntent, extractDigits } from "../utils/validation";

const PHONE_PREFIX = "+1 ";
const MAX_PHONE_DIGITS = 10;

/**
 * Normalize pasted phone input: extract digits, drop US country code (1) if 11 digits.
 */
const normalizePhoneInput = (raw: string): string => {
  const digits = extractDigits(raw);
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits.slice(0, MAX_PHONE_DIGITS);
};

/**
 * Determine if incoming text should be treated as phone input (for onChange).
 * Handles paste of "+19389298399" where first char is "+".
 */
const shouldTreatAsPhone = (text: string): boolean => {
  if (text.includes("@")) return false;
  const digits = extractDigits(text);
  const firstChar = text.trim()[0] ?? "";
  return digits.length >= 10 || /^\d$/.test(firstChar);
};

export interface EmailOrPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  cStyle?: ViewStyle;
}

const EmailOrPhoneInput: FC<EmailOrPhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  required = false,
  cStyle,
}) => {
  const { theme } = useTheme();
  const inputIntent = detectInputIntent(value);
  const isPhoneMode = inputIntent === "phone";

  // Reset key only when user clears (non-empty → empty) to fix "can't type after clear" bug.
  // Do NOT change on first character (empty → non-empty) to avoid focus loss.
  const [resetKey, setResetKey] = useState(0);
  const prevValueRef = useRef(value);
  useEffect(() => {
    const wasEmpty = prevValueRef.current === "";
    const isEmpty = value === "";
    prevValueRef.current = value;
    if (!wasEmpty && isEmpty) {
      setResetKey((k) => k + 1);
    }
  }, [value]);

  // Use "default" keyboard when empty so user can type digit OR letter to start
  // (phone-pad has no letters; email-address may confuse after clearing phone)
  const keyboardType =
    inputIntent === null
      ? "default"
      : isPhoneMode
        ? "phone-pad"
        : "email-address";

  const handleChange = (text: string) => {
    if (shouldTreatAsPhone(text)) {
      onChange(normalizePhoneInput(text));
    } else {
      onChange(text);
    }
  };

  return (
    <View style={[cStyle]}>
      <View style={styles.labelRow}>
        {label && (
          <CustomText
            variant="body2"
            style={[styles.label, { fontFamily: Fonts.semibold }]}
          >
            {label}
          </CustomText>
        )}
        {required && (
          <CustomText color={theme.colors.palette.red500} variant="body2">
            *
          </CustomText>
        )}
      </View>
      <View style={[styles.inputContainer]}>
        {isPhoneMode && (
          <Text style={[styles.prefix, { fontFamily: Fonts.semibold }]}>
            {PHONE_PREFIX}
          </Text>
        )}
        <TextInput
          key={`input-${resetKey}`}
          style={[
            styles.input,
            isPhoneMode && styles.inputWithPrefix,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.palette.grey500}
          value={value}
          onChangeText={handleChange}
          keyboardType={keyboardType}
          maxLength={isPhoneMode ? MAX_PHONE_DIGITS : undefined}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#6A6A6A33",
    paddingVertical: 5,
  },
  prefix: {
    fontSize: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#000",
    borderRightWidth: 1,
    borderRightColor: "#6A6A6A33",
  },
  input: {
    flex: 1,
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontFamily: Fonts.semibold,
    minHeight: 40,
  },
  inputWithPrefix: {
    paddingLeft: 10,
  },
});

export default EmailOrPhoneInput;
