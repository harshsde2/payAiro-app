import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@new-ui/components/common-components/CustomText';
import FilterChip from '@new-ui/components/common-components/FilterChip';
import Button from '@new-ui/components/common-components/layout/Button';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { activityFilterModalStyles } from '@new-ui/styles/screens/activity/activityFilterModalStyles';
import { AppIcon } from '@new-ui/assets/svgs';
import { formatServerDate } from 'utils/dateUtils';
import type {
  PaymentTransactionHistoryActivity,
  PaymentTransactionHistoryFilters,
  PaymentTransactionHistoryReceiveStatus,
  PaymentTransactionHistoryRequestStatus,
  PaymentTransactionHistoryScope,
  PaymentTransactionHistoryStatus,
  PaymentTransactionHistoryTradeSide,
  PaymentTransactionHistoryType,
} from 'query/hooks/useCrypto';

type ActivityFilterModalProps = {
  visible: boolean;
  initialFilters: PaymentTransactionHistoryFilters;
  onClose: () => void;
  onApply: (filters: PaymentTransactionHistoryFilters) => void;
};

// "All" sentinels for the UI — map to `undefined` (omitted) when applied, except
// activity/scope which the API also accepts literally as "all" (its documented default).
const ACTIVITY_OPTIONS: { label: string; value: PaymentTransactionHistoryActivity }[] = [
  { label: 'All', value: 'all' },
  { label: 'Send', value: 'send' },
  { label: 'Trade', value: 'trade' },
  { label: 'Ramp', value: 'ramp' },
  { label: 'Offramp', value: 'offramp' },
  { label: 'Request', value: 'request' },
  { label: 'Receive', value: 'receive' },
];

const TYPE_OPTIONS: { label: string; value: PaymentTransactionHistoryType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Internal', value: 'internal' },
  { label: 'External', value: 'external' },
];

const SCOPE_OPTIONS: { label: string; value: PaymentTransactionHistoryScope }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sent', value: 'sent' },
  { label: 'Received', value: 'received' },
];

/** `status`/`sendStatus` — send activity only. */
const STATUS_OPTIONS: { label: string; value: PaymentTransactionHistoryStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failed', value: 'FAILED' },
];

const TRADE_SIDE_OPTIONS: { label: string; value: PaymentTransactionHistoryTradeSide | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Buy', value: 'buy' },
  { label: 'Sell', value: 'sell' },
];

/** `requestStatus` — request activity only. */
const REQUEST_STATUS_OPTIONS: {
  label: string;
  value: PaymentTransactionHistoryRequestStatus | 'all';
}[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Fulfilled', value: 'FULFILLED' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Expired', value: 'EXPIRED' },
];

/** `receiveStatus` — receive activity only. Uses COMPLETED (not SUCCESS). */
const RECEIVE_STATUS_OPTIONS: {
  label: string;
  value: PaymentTransactionHistoryReceiveStatus | 'all';
}[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

const startOfDay = (d: Date): Date => {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfWeek = (d: Date): Date => {
  const next = startOfDay(d);
  const day = next.getDay(); // 0 = Sunday
  next.setDate(next.getDate() - day);
  return next;
};

const startOfMonth = (d: Date): Date => {
  const next = startOfDay(d);
  next.setDate(1);
  return next;
};

const ActivityFilterModal: React.FC<ActivityFilterModalProps> = ({
  visible,
  initialFilters,
  onClose,
  onApply,
}) => {
  const { theme } = useTheme();
  const styles = activityFilterModalStyles(theme);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const maxCardHeight = Math.max(360, windowHeight - insets.top - insets.bottom - 96);

  const [activity, setActivity] = useState<PaymentTransactionHistoryActivity>('all');
  const [type, setType] = useState<PaymentTransactionHistoryType | 'all'>('all');
  const [scope, setScope] = useState<PaymentTransactionHistoryScope>('all');
  const [status, setStatus] = useState<PaymentTransactionHistoryStatus | 'all'>('all');
  const [tradeSide, setTradeSide] = useState<PaymentTransactionHistoryTradeSide | 'all'>('all');
  const [requestStatus, setRequestStatus] = useState<
    PaymentTransactionHistoryRequestStatus | 'all'
  >('all');
  const [receiveStatus, setReceiveStatus] = useState<
    PaymentTransactionHistoryReceiveStatus | 'all'
  >('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  // Re-sync the draft from the currently-applied filters every time the modal opens,
  // so reopening without a prior Apply never shows a stale draft from an earlier session.
  useEffect(() => {
    if (!visible) return;
    setActivity(initialFilters.activity ?? 'all');
    setType(initialFilters.type ?? 'all');
    setScope(initialFilters.scope ?? 'all');
    setStatus(initialFilters.status ?? 'all');
    setTradeSide(initialFilters.tradeSide ?? 'all');
    setRequestStatus(initialFilters.requestStatus ?? 'all');
    setReceiveStatus(initialFilters.receiveStatus ?? 'all');
    setStartDate(initialFilters.startDate ? new Date(initialFilters.startDate) : null);
    setEndDate(initialFilters.endDate ? new Date(initialFilters.endDate) : null);
    setActivePicker(null);
  }, [visible, initialFilters]);

  // The API scopes each of these to one activity bucket, so only show the section that
  // can actually do something for the chosen activity (see the filters doc). Showing them
  // for `all` would look like a filter that silently does nothing.
  const showSendFilters = activity === 'send';
  const showTradeSide = activity === 'trade';
  const showRequestStatus = activity === 'request';
  const showReceiveStatus = activity === 'receive';

  // Drop selections that no longer apply so a stale one can never be applied after the
  // user switches activity.
  useEffect(() => {
    if (!showSendFilters) {
      setType('all');
      setStatus('all');
    }
    if (!showTradeSide) setTradeSide('all');
    if (!showRequestStatus) setRequestStatus('all');
    if (!showReceiveStatus) setReceiveStatus('all');
  }, [showSendFilters, showTradeSide, showRequestStatus, showReceiveStatus]);

  const handlePickerChange = useCallback(
    (event: { type: string }, date?: Date) => {
      if (Platform.OS === 'android') setActivePicker(null);
      if (event.type === 'dismissed' || !date) return;

      if (activePicker === 'start') {
        setStartDate(date);
        // Keep the range valid: an end date before the new start is meaningless.
        setEndDate((prevEnd) => (prevEnd && prevEnd < date ? null : prevEnd));
      } else if (activePicker === 'end') {
        setEndDate(date);
        setStartDate((prevStart) => (prevStart && prevStart > date ? null : prevStart));
      }
    },
    [activePicker]
  );

  const applyPreset = useCallback((preset: 'today' | 'week' | 'month') => {
    const now = new Date();
    const from =
      preset === 'today' ? startOfDay(now) : preset === 'week' ? startOfWeek(now) : startOfMonth(now);
    setStartDate(from);
    setEndDate(now);
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      activity,
      scope,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      // Activity-scoped params — only emit the ones the backend will actually honor.
      type: showSendFilters && type !== 'all' ? type : undefined,
      status: showSendFilters && status !== 'all' ? status : undefined,
      tradeSide: showTradeSide && tradeSide !== 'all' ? tradeSide : undefined,
      requestStatus: showRequestStatus && requestStatus !== 'all' ? requestStatus : undefined,
      receiveStatus: showReceiveStatus && receiveStatus !== 'all' ? receiveStatus : undefined,
    });
  }, [
    activity,
    endDate,
    scope,
    showSendFilters,
    showTradeSide,
    showRequestStatus,
    showReceiveStatus,
    startDate,
    status,
    tradeSide,
    requestStatus,
    receiveStatus,
    type,
    onApply,
  ]);

  const pickerValue = useMemo(() => {
    if (activePicker === 'start') return startDate ?? new Date();
    if (activePicker === 'end') return endDate ?? new Date();
    return new Date();
  }, [activePicker, endDate, startDate]);

  // iOS only fires onChange when the user actually scrolls the spinner. If they open the
  // picker and tap Done without touching it, nothing would ever get committed — so commit
  // whatever's currently displayed (the default "today" if untouched, or the scrolled
  // value if they did touch it — pickerValue already reflects either case).
  const handleDone = useCallback(() => {
    if (activePicker === 'start') {
      setStartDate(pickerValue);
      setEndDate((prevEnd) => (prevEnd && prevEnd < pickerValue ? null : prevEnd));
    } else if (activePicker === 'end') {
      setEndDate(pickerValue);
      setStartDate((prevStart) => (prevStart && prevStart > pickerValue ? null : prevStart));
    }
    setActivePicker(null);
  }, [activePicker, pickerValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalKav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.modalBackdrop,
            { paddingTop: insets.top + theme.spacing.sm, paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
          ]}
        >
          {/* Tap-outside-to-close catcher: a SIBLING behind the card, not a parent wrapping
              it — the card's ScrollView previously had to negotiate gesture ownership with
              two nested Pressables around it, which is what caused the scroll friction. */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.modalCloseRow}>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <AppIcon.Cancel width={32} height={32} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={[styles.modalCard, { height: undefined, maxHeight: maxCardHeight }]}>
            <CustomText variant="h5" fontWeight="bold" align="center">
              Filter
            </CustomText>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <FilterSection
                styles={styles}
                title="Activity"
                onReset={() => setActivity('all')}
              >
                <View style={styles.pillRow}>
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      selected={activity === opt.value}
                      onPress={() => setActivity(opt.value)}
                    />
                  ))}
                </View>
              </FilterSection>

              {showSendFilters ? (
                <FilterSection styles={styles} title="Type" onReset={() => setType('all')}>
                  <View style={styles.pillRow}>
                    {TYPE_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        selected={type === opt.value}
                        onPress={() => setType(opt.value)}
                      />
                    ))}
                  </View>
                </FilterSection>
              ) : null}

              <FilterSection styles={styles} title="Scope" onReset={() => setScope('all')}>
                <View style={styles.pillRow}>
                  {SCOPE_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      selected={scope === opt.value}
                      onPress={() => setScope(opt.value)}
                    />
                  ))}
                </View>
              </FilterSection>

              {showSendFilters ? (
                <FilterSection styles={styles} title="Status" onReset={() => setStatus('all')}>
                  <View style={styles.pillRow}>
                    {STATUS_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        selected={status === opt.value}
                        onPress={() => setStatus(opt.value)}
                      />
                    ))}
                  </View>
                </FilterSection>
              ) : null}

              {showTradeSide ? (
                <FilterSection
                  styles={styles}
                  title="Trade Side"
                  onReset={() => setTradeSide('all')}
                >
                  <View style={styles.pillRow}>
                    {TRADE_SIDE_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        selected={tradeSide === opt.value}
                        onPress={() => setTradeSide(opt.value)}
                      />
                    ))}
                  </View>
                </FilterSection>
              ) : null}

              {showRequestStatus ? (
                <FilterSection
                  styles={styles}
                  title="Request Status"
                  onReset={() => setRequestStatus('all')}
                >
                  <View style={styles.pillRow}>
                    {REQUEST_STATUS_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        selected={requestStatus === opt.value}
                        onPress={() => setRequestStatus(opt.value)}
                      />
                    ))}
                  </View>
                </FilterSection>
              ) : null}

              {showReceiveStatus ? (
                <FilterSection
                  styles={styles}
                  title="Receive Status"
                  onReset={() => setReceiveStatus('all')}
                >
                  <View style={styles.pillRow}>
                    {RECEIVE_STATUS_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        selected={receiveStatus === opt.value}
                        onPress={() => setReceiveStatus(opt.value)}
                      />
                    ))}
                  </View>
                </FilterSection>
              ) : null}

              <FilterSection
                styles={styles}
                title="Date Range"
                onReset={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <CustomText style={styles.dateFieldLabel}>From</CustomText>
                    <Pressable
                      style={styles.dateBox}
                      onPress={() => setActivePicker('start')}
                    >
                      <CustomText
                        style={styles.dateBoxText}
                        color={startDate ? theme.colors.text : theme.colors.textSecondary}
                      >
                        {startDate ? formatServerDate(startDate, 'MM/DD/YYYY') : 'Select date'}
                      </CustomText>
                    </Pressable>
                  </View>
                  <View style={styles.dateCol}>
                    <CustomText style={styles.dateFieldLabel}>To</CustomText>
                    <Pressable style={styles.dateBox} onPress={() => setActivePicker('end')}>
                      <CustomText
                        style={styles.dateBoxText}
                        color={endDate ? theme.colors.text : theme.colors.textSecondary}
                      >
                        {endDate ? formatServerDate(endDate, 'MM/DD/YYYY') : 'Select date'}
                      </CustomText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.presetRow}>
                  <FilterChip label="Today" selected={false} onPress={() => applyPreset('today')} />
                  <FilterChip label="This Week" selected={false} onPress={() => applyPreset('week')} />
                  <FilterChip label="This Month" selected={false} onPress={() => applyPreset('month')} />
                </View>

                {activePicker && Platform.OS === 'android' ? (
                  <DateTimePicker
                    value={pickerValue}
                    mode="date"
                    maximumDate={new Date()}
                    onChange={handlePickerChange}
                  />
                ) : null}
              </FilterSection>
            </ScrollView>

            <View style={{ marginTop: theme.spacing.md }}>
              <Button onPress={handleApply}>Apply</Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* iOS renders the picker inline, not as a popup — show it in its own overlay
          so it's always visible instead of depending on the card's scroll position. */}
      {activePicker && Platform.OS === 'ios' ? (
        <Modal visible transparent animationType="fade" onRequestClose={handleDone}>
          <Pressable style={styles.pickerBackdrop} onPress={handleDone}>
            <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
              <DateTimePicker
                value={pickerValue}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={handlePickerChange}
              />
              <View style={{ width: '100%', marginTop: theme.spacing.md }}>
                <Button onPress={handleDone}>Done</Button>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Modal>
  );
};

const FilterSection: React.FC<{
  styles: ReturnType<typeof activityFilterModalStyles>;
  title: string;
  onReset: () => void;
  children: React.ReactNode;
}> = ({ styles, title, onReset, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeaderRow}>
      <CustomText style={styles.sectionTitle}>{title}</CustomText>
      <Pressable onPress={onReset} hitSlop={8}>
        <CustomText style={styles.resetLink}>Reset</CustomText>
      </Pressable>
    </View>
    {children}
  </View>
);

export default ActivityFilterModal;
