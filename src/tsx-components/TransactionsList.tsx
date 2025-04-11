import React, { memo } from 'react';
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import TransactionCard from './TransactionCard';
import SectionHeader from './SectionHeader';
import CustomText from './CustomText';

export interface Transaction {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  amount: string;
  isPositive?: boolean;
  date?: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  title?: string;
  actionText?: string;
  onActionPress?: () => void;
  maxItems?: number;
  loading?: boolean;
  onTransactionPress?: (transaction: Transaction) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  title = 'Recent Transactions',
  actionText = 'See All',
  onActionPress,
  maxItems,
  loading = false,
  onTransactionPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const displayTransactions = maxItems ? transactions.slice(0, maxItems) : transactions;

  const renderItem: ListRenderItem<Transaction> = ({ item }) => {
    return (
      <TransactionCard
        icon={item.icon}
        title={item.title}
        subtitle={item.subtitle}
        amount={item.amount}
        isPositive={item.isPositive}
        date={item.date}
        onPress={() => onTransactionPress?.(item)}
      />
    );
  };

  const keyExtractor = (item: Transaction) => item.id;

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <CustomText variant="body1" color={theme.colors.text.secondary}>
            Loading transactions...
          </CustomText>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <CustomText variant="body1" color={theme.colors.text.secondary}>
          No transactions found
        </CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        actionText={transactions.length > 0 ? actionText : undefined} 
        onActionPress={onActionPress} 
      />
      
      <FlatList
        data={displayTransactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        scrollEnabled={false}
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
        style={styles.list}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.spacing.md,
  },
  list: {
    marginTop: theme.spacing.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
  },
});

export default memo(TransactionsList); 