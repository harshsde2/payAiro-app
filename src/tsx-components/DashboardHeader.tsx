import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { SvgXml } from 'react-native-svg';
import { SVGLoggo, SVGNotification, SVGProfile } from '../constants/images';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../constants/SCREENS';
import { useTheme } from '../styles/ThemeContext';

interface DashboardHeaderProps {
  name?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  // Create styles with theme
  const styles = createStyles(theme);
  
  console.log('Theme spacing:', theme.spacing);
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <SvgXml xml={SVGLoggo} />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>
            Welcome Back,
          </Text>
          <Text style={styles.nameText}>
            {name ?? ' Daniel Hamilton'}
          </Text>
        </View>
      </View>
      <SvgXml
        xml={SVGNotification}
        onPress={() => navigation.navigate(SCREENS.Notification as never)}
      />
    </View>
  );
};

// Create styles with theme
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: theme.spacing.spacing.md, // 16
    paddingVertical: theme.spacing.spacing.xs, // 8
    // backgroundColor: theme.colors.palette.green50,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.palette.green100,
  },
  leftSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textContainer: {
    marginHorizontal: theme.spacing.spacing.xs, // 8
  },
  welcomeText: {
    fontFamily: theme.typography.fontFamily.montserrat,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  nameText: {
    fontFamily: theme.typography.fontFamily.nexaHeavy,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
});

export default DashboardHeader;