import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, TextInput as RNTextInput, TouchableOpacity, Dimensions } from 'react-native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import Button from '@new-ui/components/common-components/layout/Button';
import { IEnterAmountProps } from '../Send/types';

const EnterAmount: React.FC<IEnterAmountProps> = ({ route }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  const inputRef = useRef<RNTextInput | null>(null);

  const { sender, type } = route.params || ({} as any);

  const [amount, setAmount] = useState<string>('');

  const dynamicFontSize = useMemo(() => {
    const { width } = Dimensions.get('window');
    const totalChars = (amount || '0.00').length + 1; // + $ prefix
    const availableWidth = width - 80;
    const charWidthRatio = 0.6;
    const ideal = availableWidth / (totalChars * charWidthRatio);
    const max = 40;
    const min = 24;
    return Math.min(max, Math.max(min, ideal));
  }, [amount]);

  const handleChangeAmount = useCallback((text: string) => {
    let sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    setAmount(sanitized);
  }, []);

  const isRequestFlow = type === 'requested';

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      padding={16}
      scrollable={false}
      contentStyle={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerArea}>
          <CustomText
            fontWeight="semiBold"
            size={18}
            style={styles.title}
          >
            {isRequestFlow ? 'Requesting from' : 'Paying'}
          </CustomText>
          <CustomText
            fontWeight="semiBold"
            size={18}
          >
            {sender || 'Recipient'}
          </CustomText>
          <CustomText
            variant="caption"
            size={14}
            color={theme.colors.primary}
            style={styles.identifier}
          >
            {sender}
          </CustomText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => inputRef.current?.focus()}
          >
            <View style={styles.amountRow}>
              <CustomText
                variant='h1'
                fontWeight="semiBold"
                size={dynamicFontSize}
                style={styles.amountCurrency}
              >
                $
              </CustomText>
              <RNTextInput
                ref={inputRef}
                value={amount}
                onChangeText={handleChangeAmount}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                placeholder="0.00"
                placeholderTextColor={theme.colors.greyDark}
                style={{
                  fontSize: dynamicFontSize,
                  fontFamily: theme.typography.fontFamily.semiBold,
                  color: theme.colors.text,
                  padding: 0,
                  margin: 0,
                  minWidth: 80,
                }}
                autoFocus
                returnKeyType="done"
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.buttonRow}>
            <Button
              color={theme.colors.black}
              style={styles.requestButton}
              height={50}
            >
              Request
            </Button>
            <Button
              style={styles.payButton}
              height={50}
              disabled={!amount}
            >
              Pay
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default EnterAmount;

