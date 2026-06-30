import React from 'react';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';
import type { CombinedDisclosureHistoryItem } from '@new-ui/types/compliance';

type Props = { item: CombinedDisclosureHistoryItem };

const formatDate = (iso: string): string => {
  const m = moment(iso);
  return m.isValid() ? m.format('MMM D, YYYY [·] h:mm A') : iso;
};

const withDollar = (value?: string): string => {
  const v = (value ?? '').trim();
  if (!v) return '--';
  return v.startsWith('$') ? v : `$${v}`;
};

const DisclosureHistoryCard: React.FC<Props> = ({ item }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const isPreTx = item.type === 'pre_transaction_disclosure';
  const typeLabel = isPreTx ? 'Pre-transaction disclosure' : 'One-time disclosure';
  const stateCode = String(item.state_code ?? '').toUpperCase();

  // Type-specific detail rows.
  const rows: { label: string; value: string }[] = [];
  if (item.type === 'pre_transaction_disclosure') {
    const d = item.details;
    const amount = item.disclosure_content?.displayValues?.transaction_amount ?? withDollar(d.purchase_amount_shown);
    rows.push({ label: 'Transaction', value: d.transaction_type === 'sell' ? 'Sell' : 'Buy' });
    rows.push({ label: 'Amount', value: amount });
    rows.push({ label: 'Fee shown', value: withDollar(d.fee_amount_shown) });
    rows.push({ label: 'Version', value: d.disclosure_version || item.disclosure_version });
  } else {
    const d = item.details;
    if (d.language) rows.push({ label: 'Language', value: d.language.toUpperCase() });
    rows.push({ label: 'Disclosure agreed', value: d.checkbox_1_checked ? '✓' : '—' });
    rows.push({ label: 'Terms agreed', value: d.checkbox_2_checked ? '✓' : '—' });
    rows.push({ label: 'Version', value: d.disclosure_version || item.disclosure_version });
  }

  return (
    <View style={styles.card}>
      {/* Header: type label + badges */}
      <View style={styles.headerRow}>
        <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.typeLabel}>
          {typeLabel}
        </CustomText>
        <View style={styles.badges}>
          {!!stateCode && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <CustomText variant="caption" fontWeight="semiBold" color={theme.colors.white}>
                {stateCode}
              </CustomText>
            </View>
          )}
          {isPreTx && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.details.transaction_type === 'sell' ? theme.colors.grey : theme.colors.success,
                },
              ]}
            >
              <CustomText variant="caption" fontWeight="semiBold" color={theme.colors.white}>
                {item.details.transaction_type === 'sell' ? 'SELL' : 'BUY'}
              </CustomText>
            </View>
          )}
        </View>
      </View>

      {/* Date */}
      <CustomText variant="caption" color={theme.colors.textSecondary} style={styles.dateText}>
        {formatDate(item.acknowledged_at)}
      </CustomText>

      {/* Optional title from server content */}
      {!!item.disclosure_content?.title && (
        <CustomText variant="caption" color={theme.colors.textSecondary} style={styles.subtitle}>
          {item.disclosure_content.title}
        </CustomText>
      )}

      <View style={styles.divider} />

      {/* Detail rows */}
      {rows.map((row, i) => (
        <View key={`${row.label}-${i}`} style={styles.row}>
          <CustomText variant="body" color={theme.colors.textSecondary} style={styles.rowLabel}>
            {row.label}
          </CustomText>
          <CustomText variant="body" fontWeight="semiBold" color={theme.colors.text} style={styles.rowValue}>
            {row.value}
          </CustomText>
        </View>
      ))}
    </View>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.greyLight,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    typeLabel: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    dateText: {
      marginTop: theme.spacing.xs,
    },
    subtitle: {
      marginTop: theme.spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    rowLabel: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    rowValue: {
      flex: 1.3,
      textAlign: 'right',
    },
  });

export default DisclosureHistoryCard;
