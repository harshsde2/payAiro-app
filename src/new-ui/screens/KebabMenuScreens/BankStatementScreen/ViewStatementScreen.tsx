import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import StatementTransactionItem from '@new-ui/components/common-components/StatementTransactionItem';
import { Button } from '@new-ui/components/common-components/layout';
import { AppIcon } from '@new-ui/assets/svgs';
import { viewStatementScreenStyles } from '@new-ui/styles/screens/bankStatement/viewStatementScreenStyles';
import { AmountType } from '@new-ui/components/common-components/StatementTransactionItem/types';

interface ITransaction {
  id: string;
  title: string;
  datetime: string;
  amount: string;
  amountType: AmountType;
  imageUri?: string;
}

const TRANSACTIONS: ITransaction[] = [
  {
    id: '1',
    title: 'Received from Elly',
    datetime: '04 Apr. 25 | 02:45pm',
    amount: '+$450.00',
    amountType: 'positive',
    imageUri: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: '2',
    title: 'Top Up',
    datetime: '03 Apr. 25 | 11:35am',
    amount: '+$700.00',
    amountType: 'positive',
  },
  {
    id: '3',
    title: 'Swapped',
    datetime: '03 Apr. 25 | 11:35am',
    amount: '0.876 BTC',
    amountType: 'crypto',
  },
  {
    id: '4',
    title: 'Paid to Dribbble',
    datetime: '23 Mar. 25 | 08:30am',
    amount: '-$250.00',
    amountType: 'negative',
  },
];

const txIcon = (tx: ITransaction, greyLight: string, ink: string) => {
  if (tx.imageUri) {
    return (
      <Image
        source={{ uri: tx.imageUri }}
        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
      />
    );
  }
  if (tx.amountType === 'positive') {
    return <AppIcon.Add width={24} height={24} />;
  }
  if (tx.amountType === 'crypto') {
    return <AppIcon.ArrowRight width={24} height={24} color={ink} />;
  }
  return <AppIcon.Send width={24} height={24} />;
};

const ViewStatementScreen = () => {
  const { theme } = useTheme();
  const styles = viewStatementScreenStyles(theme);
  const [search, setSearch] = useState('');

  const filtered = TRANSACTIONS.filter(tx =>
    tx.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.searchIcon}>
          <Text style={{ fontSize: 16, color: theme.colors.greyDark }}>🔍</Text>
        </View>
      </View>

      <View style={styles.listGap}>
        {filtered.map(tx => (
          <StatementTransactionItem
            key={tx.id}
            icon={txIcon(tx, theme.colors.greyLight, theme.colors.text)}
            title={tx.title}
            datetime={tx.datetime}
            amount={tx.amount}
            amountType={tx.amountType}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.shareRow} onPress={() => {}} activeOpacity={0.7}>
        <Text style={styles.shareText}>Share Statement</Text>
        <AppIcon.ArrowRight width={18} height={18} color={theme.colors.text} />
      </TouchableOpacity>

      <Button onPress={() => {}} style={styles.downloadButton}>
        Download Statement
      </Button>
    </ScreenWrapper>
  );
};

export default ViewStatementScreen;
