import React, { useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { statePickerStyles } from '@new-ui/styles/components/statePickerStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { TextInput } from '@new-ui/components/common-components/layout';
import { AppIcon } from '@new-ui/assets/svgs';
import {
  US_STATES,
  formatStateLabel,
  type USState,
} from '@new-ui/constants/usStates';
import { IStatePickerProps } from './types';

/**
 * Searchable US state field. Returns the 2-letter USPS code the KYC APIs expect,
 * so the user can't submit a free-text state that the backend will reject.
 */
const StatePicker: React.FC<IStatePickerProps> = ({
  label,
  value,
  onSelect,
  placeholder = 'Select state',
  hasError = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = statePickerStyles(theme);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return US_STATES;
    return US_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(query) ||
        state.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const handleSelect = useCallback(
    (state: USState) => {
      onSelect(state.code);
      close();
    },
    [onSelect, close]
  );

  const renderStateItem = useCallback(
    ({ item }: { item: USState }) => {
      const isSelected = item.code === value;
      return (
        <TouchableOpacity
          style={[styles.stateItem, isSelected && styles.selectedStateItem]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <CustomText
            variant="body"
            fontFamily="inter"
            fontWeight={isSelected ? 'medium' : 'regular'}
            style={styles.stateName}
          >
            {item.name}
          </CustomText>
          <CustomText
            variant="body"
            fontFamily="inter"
            fontWeight="medium"
            color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.stateCode}
          >
            {item.code}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleSelect, value, styles, theme.colors]
  );

  const keyExtractor = useCallback((item: USState) => item.code, []);

  const displayLabel = formatStateLabel(value);

  return (
    <View>
      {!!label && (
        <CustomText
          variant="label"
          fontWeight="semiBold"
          size={16}
          style={styles.label}
        >
          {label}
        </CustomText>
      )}

      <TouchableOpacity
        style={[styles.field, hasError && styles.fieldError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <CustomText
          variant="body"
          fontFamily="inter"
          color={displayLabel ? theme.colors.text : theme.colors.textSecondary}
        >
          {displayLabel || placeholder}
        </CustomText>
        <AppIcon.ChevronDown />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.modalBackdrop} onPress={close}>
          {/* Swallow taps inside the sheet so they don't dismiss it. */}
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.header}>
              <CustomText variant="h4" fontWeight="semiBold" style={styles.title}>
                Select State
              </CustomText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={close}
                activeOpacity={0.7}
              >
                <CustomText variant="body" color={theme.colors.primary}>
                  Close
                </CustomText>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search state..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredStates}
              renderItem={renderStateItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              style={styles.listContainer}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <CustomText
                    variant="body"
                    fontFamily="inter"
                    color={theme.colors.textSecondary}
                  >
                    No states found
                  </CustomText>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default StatePicker;
