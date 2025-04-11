import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import CustomText from './CustomText';

interface KYCBannerProps {
  onVerifyPress: () => void;
  svgIcon: string;
  slidersSvg?: string;
}

const KYCBanner: React.FC<KYCBannerProps> = ({
  onVerifyPress,
  svgIcon,
  slidersSvg
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <SvgXml xml={svgIcon} />
        <View style={styles.textContainer}>
          <CustomText 
            variant="body2" 
            color={theme.colors.palette.grey400}
            style={styles.text}
          >
            Your Second level KYC verification is pending.{' '}
            <TouchableOpacity onPress={onVerifyPress}>
              <CustomText 
                variant="body2" 
                fontWeight="bold" 
                color={theme.colors.palette.white}
                style={styles.verifyText}
              >
                {' Verify Now!'}
              </CustomText>
            </TouchableOpacity>
          </CustomText>
        </View>
      </View>
      
      {slidersSvg && (
        <SvgXml
          xml={slidersSvg}
          style={styles.slidersIcon}
        />
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.palette.black,
    width: '95%',
    padding: theme.spacing.spacing.md,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: theme.spacing.spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.spacing.sm,
  },
  text: {
    lineHeight: 20,
  },
  verifyText: {
    textDecorationLine: 'underline',
  },
  slidersIcon: {
    marginTop: theme.spacing.spacing.md,
    width: '80%',
    alignSelf: 'center',
  }
});

export default KYCBanner; 