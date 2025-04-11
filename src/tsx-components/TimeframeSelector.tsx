import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';
import { TimeframeType } from './ChartSelector';

interface TimeframeSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  selectedTimeframe: TimeframeType;
  onSelectTimeframe: (timeframe: TimeframeType) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  isVisible,
  onClose,
  selectedTimeframe,
  onSelectTimeframe
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const timeframes: { label: string; value: TimeframeType }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ];

  const handleSelect = (timeframe: TimeframeType) => {
    onSelectTimeframe(timeframe);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <CustomText 
              variant="subtitle1" 
              fontWeight="semiBold"
              style={styles.title}
            >
              Select Timeframe
            </CustomText>
          </View>
          
          <View style={styles.optionsContainer}>
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.value}
                style={[
                  styles.option,
                  selectedTimeframe === timeframe.value && styles.selectedOption
                ]}
                onPress={() => handleSelect(timeframe.value)}
              >
                <CustomText 
                  variant="button"
                  color={selectedTimeframe === timeframe.value ? 
                    theme.colors.palette.white : 
                    theme.colors.text.primary}
                >
                  {timeframe.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <CustomText 
              variant="button"
              color={theme.colors.palette.error}
            >
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.card.background,
    borderRadius: 16,
    padding: theme.spacing.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingBottom: theme.spacing.spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: theme.spacing.spacing.md,
  },
  option: {
    paddingVertical: theme.spacing.spacing.sm,
    paddingHorizontal: theme.spacing.spacing.md,
    marginBottom: theme.spacing.spacing.xs,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: theme.colors.palette.primary,
  },
  cancelButton: {
    paddingVertical: theme.spacing.spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  }
});

export default memo(TimeframeSelector); 