import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import FilterChip from "@new-ui/components/common-components/FilterChip";
import CryptoRequestCard from "@new-ui/components/common-components/CryptoRequestCard";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useCryptoRequestHistory } from "query/hooks/useCryptoRequest";
import type {
  CryptoRequestScope,
  CryptoRequestStatus,
  ICryptoRequest,
} from "query/hooks/cryptoRequest.types";

const SCOPE_OPTIONS: { label: string; value: CryptoRequestScope }[] = [
  { label: "Received", value: "received" },
  { label: "Sent", value: "sent" },
  { label: "All", value: "all" },
];

const STATUS_OPTIONS: { label: string; value?: CryptoRequestStatus }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Fulfilled", value: "FULFILLED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

const CryptoRequestsListScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<any>();

  const [scope, setScope] = useState<CryptoRequestScope>("all");
  const [status, setStatus] = useState<CryptoRequestStatus | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useCryptoRequestHistory(
    scope,
    status,
    50
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const items: ICryptoRequest[] = useMemo(() => {
    const list = data?.data?.items ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  const openDetail = (request: ICryptoRequest) => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_CRYPTO_REQUEST_DETAIL, {
      id: request.id,
      request,
    });
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.background}
    >
      <View style={styles.filters}>
        <View style={styles.chipRow}>
          {SCOPE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              selected={scope === opt.value}
              onPress={() => setScope(opt.value)}
            />
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusRow}
        >
          {STATUS_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.label}
              label={opt.label}
              selected={status === opt.value}
              onPress={() => setStatus(opt.value)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <CustomText style={styles.emptyText}>
              Couldn't load requests. Pull to retry.
            </CustomText>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <CustomText style={styles.emptyText}>
              No requests here yet.
            </CustomText>
          </View>
        ) : (
          items.map((request) => (
            <CryptoRequestCard
              key={request.id}
              request={request}
              onPress={openDetail}
            />
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    filters: {
      paddingHorizontal: 15,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    chipRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    statusRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    listContent: {
      paddingHorizontal: 15,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing["2xl"],
      gap: theme.spacing.md,
      flexGrow: 1,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["4xl"],
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });

export default CryptoRequestsListScreen;
