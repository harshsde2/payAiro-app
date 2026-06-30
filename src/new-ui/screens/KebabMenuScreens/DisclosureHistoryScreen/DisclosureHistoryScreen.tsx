import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import DisclosureHistoryCard from '@new-ui/components/common-components/DisclosureHistoryCard/DisclosureHistoryCard';
import { useTheme } from '@new-ui/styles/ThemeContext';
import type { ITheme } from '@new-ui/styles/themes/themeTypes';
import { useCombinedDisclosureHistory } from 'query/hooks/useComplianceDisclosure';
import type { CombinedDisclosureHistoryItem } from '@new-ui/types/compliance';

const DisclosureHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const { data, isLoading, isError, refetch, isRefetching } = useCombinedDisclosureHistory();
  const items = data ?? [];

  const keyExtractor = useCallback(
    (item: CombinedDisclosureHistoryItem, index: number) =>
      `${item.type}-${item.details?.id ?? index}`,
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: CombinedDisclosureHistoryItem }) => <DisclosureHistoryCard item={item} />,
    []
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View style={styles.centerFill}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  } else if (isError) {
    body = (
      <View style={styles.centerFill}>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.message}>
          Unable to load your acknowledgment history.
        </CustomText>
        <Button onPress={() => refetch()}>Retry</Button>
      </View>
    );
  } else if (items.length === 0) {
    body = (
      <View style={styles.centerFill}>
        <CustomText variant="body" color={theme.colors.textSecondary} style={styles.message}>
          No acknowledgments yet. Your compliance acknowledgments will appear here.
        </CustomText>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
      />
    );
  }

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable={false}
      backgroundColor={theme.colors.background}
      contentStyle={styles.content}
    >
      {body}
    </ScreenWrapper>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    // ScreenWrapper's non-scroll content View has no flex by default — fill it so
    // the FlatList can scroll and the centered loader/empty/error states get height.
    content: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing['2xl'],
      gap: theme.spacing.lg,
    },
    message: {
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default DisclosureHistoryScreen;
