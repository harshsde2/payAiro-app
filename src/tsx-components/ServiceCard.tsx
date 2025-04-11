import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';
import Card from './Card';

interface ServiceCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  buttonText?: string;
  backgroundColor?: string;
  subtitle?: string;
  buttonBackgroundColor?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  icon,
  onPress,
  buttonText = 'Explore',
  backgroundColor,
  subtitle,
  buttonBackgroundColor
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Card 
      style={[
        styles.container, 
        backgroundColor ? { backgroundColor } : null
      ]}
    >
      <View style={styles.content}>
        <SvgXml xml={icon} />
        <View style={styles.textContainer}>
          <CustomText 
            variant="subtitle2" 
            fontWeight="semiBold" 
            style={styles.title}
          >
            {title}
          </CustomText>
          
          {subtitle && (
            <CustomText 
              variant="caption" 
              color={theme.colors.text.secondary}
            >
              {subtitle}
            </CustomText>
          )}
          
          <TouchableOpacity 
            style={[
              styles.button,
              buttonBackgroundColor ? { backgroundColor: buttonBackgroundColor } : null
            ]}
            onPress={onPress}
          >
            <CustomText 
              variant="caption" 
              fontWeight="semiBold"
              color={theme.colors.palette.white}
            >
              {buttonText}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.palette.grey100,
    borderRadius: 15,
    padding: theme.spacing.spacing.md,
    marginRight: theme.spacing.spacing.sm,
    width: 170,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: theme.spacing.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.palette.black,
    paddingVertical: theme.spacing.spacing.xxs,
    paddingHorizontal: theme.spacing.spacing.xs,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
    marginTop: theme.spacing.spacing.xs,
  },
});

export default memo(ServiceCard); 