import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface RewardCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  backgroundColor?: string;
}

const RewardCard: React.FC<RewardCardProps> = ({
  title,
  icon,
  onPress,
  backgroundColor
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        backgroundColor ? { backgroundColor } : null
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <SvgXml xml={icon} width={24} height={24} />
      </View>
      <CustomText 
        variant="caption" 
        fontWeight="semiBold"
        color={theme.colors.text.primary}
        style={styles.title}
      >
        {title}
      </CustomText>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: theme.colors.palette.green100,
    padding: theme.spacing.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.sm,
  },
  title: {
    textAlign: 'center',
  }
});

export default memo(RewardCard); 