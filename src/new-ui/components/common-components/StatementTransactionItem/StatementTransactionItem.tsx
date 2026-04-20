import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { statementTransactionItemStyles } from '@new-ui/styles/components/statementTransactionItemStyles';
import CustomText from '@new-ui/components/common-components/CustomText';
import { IStatementTransactionItemProps } from './types';

const StatementTransactionItem: React.FC<IStatementTransactionItemProps> = ({
  icon,
  title,
  datetime,
  amount,
  amountType,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = statementTransactionItemStyles(theme);

  const amountStyle =
    amountType === 'negative'
      ? styles.amountNegative
      : amountType === 'crypto'
      ? styles.amountCrypto
      : styles.amountPositive;

  const content = (
    <>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.textContainer}>
        <CustomText style={styles.title}>{title}</CustomText>
        <CustomText style={styles.datetime}>{datetime}</CustomText>
      </View>
      <CustomText style={amountStyle}>{amount}</CustomText>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

export default StatementTransactionItem;
