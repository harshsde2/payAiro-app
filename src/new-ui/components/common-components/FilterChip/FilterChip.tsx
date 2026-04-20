import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { filterChipStyles } from '@new-ui/styles/components/filterChipStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { IFilterChipProps } from './types';

const FilterChip: React.FC<IFilterChipProps> = ({ label, selected, onPress }) => {
  const { theme } = useTheme();
  const styles = filterChipStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <CustomText style={selected ? styles.labelSelected : styles.labelUnselected}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );
};

export default FilterChip;
