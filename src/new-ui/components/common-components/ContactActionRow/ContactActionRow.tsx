import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { contactActionRowStyles } from '@new-ui/styles/components/contactActionRowStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { IContactActionRowProps } from './types';

const ContactActionRow: React.FC<IContactActionRowProps> = ({ icon, title, subtitle, onPress }) => {
  const { theme } = useTheme();
  const styles = contactActionRowStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.textContainer}>
        <CustomText variant="h5" fontWeight="semiBold" size={15}>{title}</CustomText>
        <CustomText variant="caption" fontWeight="regular" size={12} color={theme.colors.textSecondary}>
          {subtitle}
        </CustomText>
      </View>
      <View style={styles.chevron}>
        <AppIcon.ChevronRight width={18} height={18} />
      </View>
    </TouchableOpacity>
  );
};

export default ContactActionRow;
