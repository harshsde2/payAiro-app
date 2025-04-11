import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

/**
 * A component to test and showcase the app's typography
 */
const FontTest: React.FC = () => {
  const { theme } = useTheme();
  
  // Create a typed version of styles to fix TypeScript issues
  const typedStyles = {
    h1: { ...theme.typography.textStyles.h1 } as any,
    h2: { ...theme.typography.textStyles.h2 } as any,
    h3: { ...theme.typography.textStyles.h3 } as any,
    h4: { ...theme.typography.textStyles.h4 } as any,
    subtitle1: { ...theme.typography.textStyles.subtitle1 } as any,
    subtitle2: { ...theme.typography.textStyles.subtitle2 } as any,
    body1: { ...theme.typography.textStyles.body1 } as any,
    body2: { ...theme.typography.textStyles.body2 } as any,
    button: { ...theme.typography.textStyles.button } as any,
    caption: { ...theme.typography.textStyles.caption } as any,
  };
  
  const styles = createStyles(theme);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Font Families</CustomText>
        
        <View style={styles.fontCard}>
          <CustomText style={styles.fontName}>Nexa Heavy (Headings)</CustomText>
          <CustomText style={styles.nexaHeavy}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</CustomText>
          <CustomText style={styles.nexaHeavy}>abcdefghijklmnopqrstuvwxyz</CustomText>
          <CustomText style={styles.nexaHeavy}>1234567890</CustomText>
        </View>
        
        <View style={styles.fontCard}>
          <CustomText style={styles.fontName}>Montserrat (Body & Subheadings)</CustomText>
          <CustomText style={styles.montserratRegular}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</CustomText>
          <CustomText style={styles.montserratRegular}>abcdefghijklmnopqrstuvwxyz</CustomText>
          <CustomText style={styles.montserratRegular}>1234567890</CustomText>
        </View>
      </View>
      
      <View style={styles.section}>
        <CustomText style={styles.sectionTitle}>Typography Styles</CustomText>
        
        <Text style={typedStyles.h1}>Heading 1</Text>
        <Text style={typedStyles.h2}>Heading 2</Text>
        <Text style={typedStyles.h3}>Heading 3</Text>
        <Text style={typedStyles.h4}>Heading 4</Text>
        <Text style={typedStyles.subtitle1}>Subtitle 1</Text>
        <Text style={typedStyles.subtitle2}>Subtitle 2</Text>
        <Text style={typedStyles.body1}>Body 1: Main text used throughout the app</Text>
        <Text style={typedStyles.body2}>Body 2: Secondary text used for less important information</Text>
        <Text style={typedStyles.button}>BUTTON TEXT</Text>
        <Text style={typedStyles.caption}>Caption: Used for small annotations</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Montserrat Weights</Text>
        
        <Text style={styles.montserratRegular}>Montserrat Regular</Text>
        <Text style={styles.montserratMedium}>Montserrat Medium</Text>
        <Text style={styles.montserratSemiBold}>Montserrat SemiBold</Text>
        <Text style={styles.montserratBold}>Montserrat Bold</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  fontCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: theme.colors.background.primary,
    borderRadius: 8,
  },
  fontName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nexaHeavy: {
    fontFamily: 'Nexa-Heavy',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratRegular: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratMedium: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratSemiBold: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratBold: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FontTest; 