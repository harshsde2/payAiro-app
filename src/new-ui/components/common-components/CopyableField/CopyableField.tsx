import React, { useCallback } from 'react';
import { Clipboard, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { copyableFieldStyles } from '@new-ui/styles/components/copyableFieldStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { ICopyableFieldProps } from './types';

const CopyableField: React.FC<ICopyableFieldProps> = ({ label, value, displayValue }) => {
  const { theme } = useTheme();
  const styles = copyableFieldStyles(theme);

  const handleCopy = useCallback(() => {
    Clipboard.setString(value);
  }, [value]);

  return (
    <View style={styles.container}>
      <CustomText style={styles.label}>{label}</CustomText>
      <View style={styles.fieldRow}>
        <CustomText style={styles.value} numberOfLines={1}>{displayValue ?? value}</CustomText>
        <TouchableOpacity onPress={handleCopy} style={styles.copyIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AppIcon.Copygreen width={20} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CopyableField;
