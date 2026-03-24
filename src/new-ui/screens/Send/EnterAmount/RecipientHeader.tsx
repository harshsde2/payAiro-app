import React, { useMemo } from 'react';
import { View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { enterAmountStyles } from '@new-ui/styles/screens/send/enterAmountStyles';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { ISendContactItem } from 'new-ui/components/common-components/SendContactsList';

type RecipientHeaderProps = {
  recipient_identifier: string;
  type?: 'request' | 'send';
  selectedContact?: ISendContactItem;
};

const RecipientHeader: React.FC<RecipientHeaderProps> = ({ recipient_identifier, type, selectedContact }) => {
  const { theme } = useTheme();
  const styles = enterAmountStyles(theme);
  console.log("selectedContact =>", JSON.stringify(selectedContact, null, 2));

  const isRequestFlow = type === 'request';
  const title = useMemo(
    () => (isRequestFlow ? 'Requesting from' : 'Paying'),
    [isRequestFlow]
  );

  return (
    <View style={styles.headerArea}>
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
        <CustomText
          fontWeight="semiBold"
          size={18}
          style={styles.title}
        >
          {title}
        </CustomText>
        <CustomText fontWeight="semiBold" size={18}>
          {selectedContact?.nickname}
        </CustomText>
      </View>
      <CustomText
        variant="caption"
        size={14}
        color={theme.colors.primary}
        style={styles.identifier}
      >
        {recipient_identifier}
      </CustomText>
    </View>
  );
};

export default RecipientHeader;

