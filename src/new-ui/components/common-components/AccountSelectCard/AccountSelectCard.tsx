import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { accountSelectCardStyles } from '@new-ui/styles/components/accountSelectCardStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { IAccountSelectCardProps } from './types';

const AccountSelectCard: React.FC<IAccountSelectCardProps> = ({
  icon,
  title,
  maskedAccount,
  selected,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = accountSelectCardStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <CustomText style={styles.title}>{title}</CustomText>
        <CustomText style={styles.maskedAccount}>{maskedAccount}</CustomText>
      </View>
      <View style={styles.checkIcon}>
        {selected ? (
          <AppIcon.TickCheckedBox width={22} height={22} />
        ) : (
          <AppIcon.UntickCheckedBox width={22} height={22} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AccountSelectCard;
