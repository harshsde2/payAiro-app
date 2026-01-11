import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from 'styles';
import { CustomText } from 'tsx-components';
import { IDatePickerProps } from './types';

const DatePicker: React.FC<IDatePickerProps> = ({
  modal = true,
  mode = 'date',
  open = false,
  date = new Date(),
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
  title = 'Select Date',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  useEffect(() => {
    setShowPicker(open);
    if (open) {
      setSelectedDate(date);
    }
  }, [open, date]);

  const handleChange = (event: DateTimePickerEvent, newDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && newDate) {
        onConfirm?.(newDate);
      } else {
        onCancel?.();
      }
    } else {
      if (newDate) {
        setSelectedDate(newDate);
      }
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    onConfirm?.(selectedDate);
  };

  const handleCancel = () => {
    setShowPicker(false);
    onCancel?.();
  };

  // For Android, just render the picker directly when open
  if (Platform.OS === 'android') {
    if (!showPicker) return null;

    return (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="default"
        onChange={handleChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  // For iOS, render in a modal
  if (!modal) {
    if (!showPicker) return null;
    return (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="spinner"
        onChange={handleChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  return (
    <Modal
      visible={showPicker}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background.primary },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <CustomText
                variant="body1"
                color={theme.colors.palette.red500}
              >
                {cancelText}
              </CustomText>
            </TouchableOpacity>
            <CustomText
              variant="subtitle1"
              fontWeight="semiBold"
              color={theme.colors.text.primary}
            >
              {title}
            </CustomText>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <CustomText
                variant="body1"
                color={theme.colors.palette.green600}
                fontWeight="semiBold"
              >
                {confirmText}
              </CustomText>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerButton: {
    padding: 8,
  },
  picker: {
    height: 200,
  },
});

export default DatePicker;
