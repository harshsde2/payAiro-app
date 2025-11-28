import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@styles/ThemeContext';
import { countryCodePickerStyles } from '@styles/components/countryCodePickerStyles';
import CustomText from '@components/common-components/CustomText';
import { TextInput } from '@components/common-components/layout';
import { COUNTRY_CODES } from './countryData';
import { ICountryCodePickerProps, ICountryCode } from './types';

const CountryCodePicker: React.FC<ICountryCodePickerProps> = ({
  onSelect,
  selectedCode,
}) => {
  const { theme } = useTheme();
  const styles = countryCodePickerStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return COUNTRY_CODES;
    }
    const query = searchQuery.toLowerCase();
    return COUNTRY_CODES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(
    (country: ICountryCode) => {
      onSelect(country);
    },
    [onSelect]
  );

  const renderCountryItem = useCallback(
    ({ item }: { item: ICountryCode }) => {
      const isSelected = item.dialCode === selectedCode;
      return (
        <TouchableOpacity
          style={[styles.countryItem, isSelected && styles.selectedCountryItem]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <CustomText style={styles.flag}>{item.flag}</CustomText>
          <View style={styles.countryInfo}>
            <CustomText
              variant="body"
              fontFamily="inter"
              fontWeight={isSelected ? 'medium' : 'regular'}
              style={styles.countryName}
            >
              {item.name}
            </CustomText>
          </View>
          <CustomText
            variant="body"
            fontFamily="inter"
            fontWeight="medium"
            color={isSelected ? theme.colors.primary : theme.colors.text}
            style={styles.dialCode}
          >
            {item.dialCode}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleSelect, selectedCode, styles, theme.colors]
  );

  const keyExtractor = useCallback((item: ICountryCode) => item.code, []);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <CustomText
          variant="body"
          fontFamily="inter"
          color={theme.colors.textSecondary}
        >
          No countries found
        </CustomText>
      </View>
    ),
    [styles.emptyContainer, theme.colors.textSecondary]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText variant="h4" fontWeight="semiBold" style={styles.title}>
          Select Country
        </CustomText>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search country or code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredCountries}
        renderItem={renderCountryItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        style={styles.listContainer}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default CountryCodePicker;

