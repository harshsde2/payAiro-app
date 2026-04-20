import React from 'react';
import { Pressable } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { addBalanceStyles } from '@new-ui/styles/screens/addBalance/addBalanceStyles';

type AddNewCardLinkProps = {
  label: string;
  onPress: () => void;
};

const AddNewCardLink: React.FC<AddNewCardLinkProps> = ({ label, onPress }) => {
  const { theme } = useTheme();
  const styles = addBalanceStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addNewCard, pressed && { opacity: 0.75 }]}
    >
      <CustomText variant="body" fontWeight="semiBold" color={theme.colors.primary}>
        {label}
      </CustomText>
    </Pressable>
  );
};

export default AddNewCardLink;
