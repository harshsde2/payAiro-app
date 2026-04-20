import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { TextInput, Button } from '@new-ui/components/common-components/layout';
import AccountSelectCard from '@new-ui/components/common-components/AccountSelectCard';
import FilterChip from '@new-ui/components/common-components/FilterChip';
import { AppIcon } from '@new-ui/assets/svgs';
import DashboardSection from 'tsx-components/DashboardSection';
import { bankStatementScreenStyles } from '@new-ui/styles/screens/bankStatement/bankStatementScreenStyles';

const TX_TYPES = ['All', 'Debit', 'Credit'] as const;
type TxType = typeof TX_TYPES[number];

const DATE_RANGES = ['Last Week', 'Last Month', 'Last 90 Days'] as const;
type DateRange = typeof DATE_RANGES[number];

const BankStatementScreen = () => {
  const { theme } = useTheme();
  const styles = bankStatementScreenStyles(theme);
  const navigation = useNavigation<any>();

  const [payAiroSelected, setPayAiroSelected] = useState(true);
  const [cryptoSelected, setCryptoSelected] = useState(true);
  const [txType, setTxType] = useState<TxType>('All');
  const [dateRange, setDateRange] = useState<DateRange>('Last Week');
  const [fromDate, setFromDate] = useState('10/12/1967');
  const [toDate, setToDate] = useState('10/12/1967');

  const handleReset = () => {
    setTxType('All');
    setDateRange('Last Week');
    setFromDate('');
    setToDate('');
  };

  const calendarIcon = <AppIcon.DebitCard width={20} height={20} />;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={styles.content}
    >
      <View style={{ paddingHorizontal: 16,flex: 1 }}>

      <CustomText
        variant="body"
        fontFamily="inter"
        size={14}
        style={styles.subtitle}
      >
        Select account(s) and dates to download{'\n'}or view activity statement.
      </CustomText>

      <View style={styles.cardGap}>
        <AccountSelectCard
          icon={<AppIcon.PayairoLogoBlack width={28} height={28} />}
          title="PayAiro Account"
          maskedAccount="********8907"
          selected={payAiroSelected}
          onPress={() => setPayAiroSelected(prev => !prev)}
        />
        <AccountSelectCard
          icon={<AppIcon.AllCryptos width={28} height={28} />}
          title="Crypto Assets"
          maskedAccount="S5********N0×1"
          selected={cryptoSelected}
          onPress={() => setCryptoSelected(prev => !prev)}
        />
      </View>

      <DashboardSection title="Transaction Type">
        <View style={styles.chipRow}>
          {TX_TYPES.map(type => (
            <FilterChip
              key={type}
              label={type}
              selected={txType === type}
              onPress={() => setTxType(type)}
            />
          ))}
        </View>
      </DashboardSection>

      <DashboardSection
        title="Date Range"
        actionText="Reset"
        onActionPress={handleReset}
      >
        <View style={styles.chipRow}>
          {DATE_RANGES.map(range => (
            <FilterChip
              key={range}
              label={range}
              selected={dateRange === range}
              onPress={() => setDateRange(range)}
            />
          ))}
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <CustomText style={styles.dateLabel}>From</CustomText>
            <TextInput
              placeholder="MM/DD/YYYY"
              value={fromDate}
              onChangeText={setFromDate}
              rightIcon={calendarIcon}
              showRightSeparator={false}
              height={46}
            />
          </View>
          <View style={styles.dateField}>
            <CustomText style={styles.dateLabel}>To</CustomText>
            <TextInput
              placeholder="MM/DD/YYYY"
              value={toDate}
              onChangeText={setToDate}
              rightIcon={calendarIcon}
              showRightSeparator={false}
              height={46}
            />
          </View>
        </View>
      </DashboardSection>

      </View>
      <TouchableOpacity style={styles.downloadRow} onPress={() => {}} activeOpacity={0.7}>
        <CustomText style={styles.downloadText}>Download Statement</CustomText>
        <AppIcon.ArrowRight width={18} height={18} />
      </TouchableOpacity>

      <Button onPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_VIEW_STATEMENT_SCREEN as never)}>
        View Statement
      </Button>
    </ScreenWrapper>
  );
};

export default BankStatementScreen;
