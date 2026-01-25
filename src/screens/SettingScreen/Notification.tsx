import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HeaderTitle from "../../components/HeaderTitle";
import Notificatiom from "../Authentications/Notificatiom";
import { useTheme } from "../../styles/ThemeContext";
import CustomText from "../../tsx-components/CustomText";
import { ScreenContainer } from "HOC";
import { useNotificationsPaginated } from "../../query/hooks";
import { INotificationItem } from "../../query/hooks/types";

const { SVGLeftArrow } = require("../../constants/images");

const PAGE_SIZE = 12;

export default function Notification() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = customStyles(theme);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchNotifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useNotificationsPaginated(PAGE_SIZE, true);

  const notifications = useMemo(
    () => data?.pages?.flatMap((page) => page?.data ?? []) ?? [],
    [data]
  );

  const errorMessage = isError
    ? (error as any)?.response?.data?.message ||
      error?.message ||
      "Failed to load notifications"
    : null;

  const handleGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // BackHandler.exitApp();
      }
    } catch (err) {
      console.log("Navigation error:", err);
    }
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: INotificationItem }) => (
      <View style={styles.notificationItem}>
        <Notificatiom item={item} />
      </View>
    ),
    [styles.notificationItem]
  );

  const keyExtractor = useCallback(
    (item: INotificationItem, index: number) =>
      String(item?.id ?? `notification-${index}`),
    []
  );

  const listFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="large" color={theme.colors.palette.green600} />
          <CustomText
            variant="caption"
            color={theme.colors.text.secondary}
            style={{ marginTop: 8 }}
          >
            Loading more...
          </CustomText>
        </View>
      );
    }
    // if (hasNextPage) {
    //   return (
    //     <TouchableOpacity
    //       style={styles.loadMoreButton}
    //       onPress={handleLoadMore}
    //     >
    //       <CustomText variant="button" color={theme.colors.text.inverse}>
    //         Load more
    //       </CustomText>
    //     </TouchableOpacity>
    //   );
    // }
    if (notifications.length > 0 && !hasNextPage) {
      return (
        <View style={styles.footerLoader}>
          <CustomText variant="caption" color={theme.colors.text.secondary}>
            No more notifications
          </CustomText>
        </View>
      );
    }
    return null;
  }, [
    handleLoadMore,
    hasNextPage,
    isFetchingNextPage,
    notifications.length,
    styles.footerLoader,
    styles.loadMoreButton,
    theme.colors.palette.green600,
    theme.colors.text.inverse,
    theme.colors.text.secondary,
  ]);

  if (isLoading) {
    return (
      <ScreenContainer
        padding={0}
        backgroundColor={theme.colors.palette.green50}
        style={styles.safeArea}
      >
        <HeaderTitle
          title="Notifications"
          leftIcon={SVGLeftArrow}
          isBack={true}
          onPressLeft={handleGoBack}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.palette.green600} />
          <CustomText
            variant="body1"
            color={theme.colors.text.secondary}
            style={{ marginTop: 16 }}
          >
            Loading notifications...
          </CustomText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError || errorMessage) {
    return (
      <ScreenContainer
        padding={0}
        backgroundColor={theme.colors.palette.green50}
        style={styles.safeArea}
      >
        <HeaderTitle
          title="Notifications"
          leftIcon={SVGLeftArrow}
          isBack={true}
          onPressLeft={handleGoBack}
        />
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.palette.red500}>
            {errorMessage || "Failed to load notifications"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchNotifications()}
          >
            <CustomText variant="button" color={theme.colors.text.inverse}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.palette.green50}
      style={styles.safeArea}
    >
      <HeaderTitle
        title="Notifications"
        leftIcon={SVGLeftArrow}
        isBack={true}
        onPressLeft={handleGoBack}
      />

      <View style={styles.container}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={
            notifications.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomText variant="body1" color={theme.colors.text.secondary}>
                No notifications available
              </CustomText>
            </View>
          }
          refreshing={isRefetching}
          onRefresh={() => refetchNotifications()}
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
        />
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.spacing.md,
    },
    retryButton: {
      padding: theme.spacing.spacing.md,
      backgroundColor: theme.colors.palette.green600,
      borderRadius: 8,
      marginTop: theme.spacing.spacing.md,
    },
    listContent: {
      paddingVertical: theme.spacing.spacing.md,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingVertical: theme.spacing.spacing.md,
    },
    emptyContainer: {
      alignItems: "center",
    },
    notificationItem: {
      marginBottom: theme.spacing.spacing.sm,
    },
    footerLoader: {
      paddingVertical: theme.spacing.spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    loadMoreButton: {
      paddingVertical: theme.spacing.spacing.sm,
      paddingHorizontal: theme.spacing.spacing.lg,
      backgroundColor: theme.colors.palette.green600,
      borderRadius: 24,
      alignSelf: "center",
      marginBottom: theme.spacing.spacing.md,
    },
  });
