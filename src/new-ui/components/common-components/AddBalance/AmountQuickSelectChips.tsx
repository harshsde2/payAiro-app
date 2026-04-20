import React from 'react';
import { View, Pressable } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

type AmountQuickSelectChipsProps = {
  values: number[];
  selectedIndex: number | null;
  onSelect: (value: number, index: number) => void;
};

const AmountQuickSelectChips: React.FC<AmountQuickSelectChipsProps> = ({
  values,
  selectedIndex,
  onSelect,
}) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  return (
    <View style={styles.chipsRow}>
      {values.map((value, index) => {
        const selected = selectedIndex === index;
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value, index)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && { opacity: 0.85 },
            ]}
          >
            <CustomText
              variant="body"

              color={selected ? theme.colors.primary : theme.colors.textSecondary}
            >
              {value}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default AmountQuickSelectChips;
