import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Keyboard,
} from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface PinInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  onComplete: (pin: string, shouldVerify: boolean) => void;
  pinLength?: number;
}

const PinInputModal: React.FC<PinInputModalProps> = ({
  isVisible,
  onClose,
  title,
  onComplete,
  pinLength = 4,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [pin, setPin] = useState<string>('');
  const inputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    // Reset pin when modal visibility changes
    if (isVisible) {
      setPin('');
    }
  }, [isVisible]);
  
  useEffect(() => {
    // Auto-focus the input when modal becomes visible
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isVisible]);
  
  const handlePinChange = (text: string) => {
    // Only accept digits up to the pin length
    const newPin = text.replace(/[^0-9]/g, '').slice(0, pinLength);
    setPin(newPin);
    
    // Auto-submit when pin length is reached
    if (newPin.length === pinLength) {
      Keyboard.dismiss();
      // Use first-time PIN creation flow (requires verification)
      onComplete(newPin, true);
    }
  };
  
  const renderDots = () => {
    const dots = [];
    
    for (let i = 0; i < pinLength; i++) {
      dots.push(
        <View 
          key={i} 
          style={[
            styles.dot, 
            i < pin.length ? styles.filledDot : {}
          ]} 
        />
      );
    }
    
    return dots;
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <CustomText 
            variant="h4" 
            fontWeight="bold" 
            style={styles.title}
          >
            {title}
          </CustomText>
          
          <View style={styles.dotsContainer}>
            {renderDots()}
          </View>
          
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="numeric"
            maxLength={pinLength}
            style={styles.hiddenInput}
            autoFocus
            secureTextEntry
          />
          
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.colors.card.background,
    borderRadius: 16,
    padding: theme.spacing.spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.spacing.lg,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.spacing.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.palette.primary,
    marginHorizontal: theme.spacing.spacing.xs,
  },
  filledDot: {
    backgroundColor: theme.colors.palette.primary,
  },
  hiddenInput: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
  },
  cancelButton: {
    marginTop: theme.spacing.spacing.lg,
    paddingVertical: theme.spacing.spacing.sm,
    paddingHorizontal: theme.spacing.spacing.md,
  },
});

export default memo(PinInputModal); 