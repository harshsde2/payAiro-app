import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgUri } from "react-native-svg";
import { useGetAssetList, useSelectCryptoCurrency, useRefreshCryptoBalance } from "query/hooks";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setSelectedCurrency } from "redux/slices/authenticationSlice";
import { setItem, STORAGE_KEYS } from "storage/mmkv";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";

const CryptoList = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const styles = cryptoListStyles(theme);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data, isPending, isFetched, isSuccess, isError, error, isFetching, refetch } =
    useGetAssetList();

  console.log(JSON.stringify(data, null, 2), "data");

  const { selectCurrency } = useSelectCryptoCurrency();
  const { refreshBalance } = useRefreshCryptoBalance();

  // Validate item data before navigation
  const validateItemData = (item: any): boolean => {
    if (!item) {
      Alert.alert("Error", "Invalid asset data. Please try again.");
      return false;
    }

    if (!item.symbol || typeof item.symbol !== "string") {
      Alert.alert("Error", "Asset symbol is missing or invalid.");
      return false;
    }

    if (!item.image || typeof item.image !== "string") {
      Alert.alert("Error", "Asset image is missing or invalid.");
      return false;
    }

    return true;
  };

  const handleCurrencySelection = async (item: any) => {
    // Validate item data first
    if (!validateItemData(item)) {
      return;
    }

    try {
      setSelectedItemId(item.symbol);
      
      // Validate symbol before making API call
      if (!item.symbol || item.symbol.trim() === "") {
        Alert.alert("Error", "Invalid asset symbol. Please try again.");
        setSelectedItemId(null);
        return;
      }

      const result = await selectCurrency(item.symbol);
      
      console.log(JSON.stringify(result?.data, null, 2), "result?.data?.rounded_balance");
      
      // Validate result before navigation
      if (!result || !result.data) {
        Alert.alert("Error", "Failed to fetch asset balance. Please try again.");
        setSelectedItemId(null);
        return;
      }
      
      // Map new API response structure to expected format
      navigation.navigate(NAVIGATION_SCREENS.ADD_CRYPTO, {
        item: {
          symbol: item.symbol,
          logo: item.image, // Map image to logo
          network: item.network || null,
          name: item.name || item.symbol,
        },
      });
    } catch (error: any) {
      console.log("Error selecting currency:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to select currency. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSelectedItemId(null);
    }
  };

  // Get normalized data array
  const getNormalizedData = (): any[] => {
    if (!data?.data) {
      return [];
    }

    if (Array.isArray(data.data)) {
      // Filter out invalid items
      return data.data.filter(
        (item: any) =>
          item &&
          item.symbol &&
          typeof item.symbol === "string" &&
          item.symbol.trim() !== ""
      );
    }

    // Single object case
    if (data.data && typeof data.data === "object") {
      if (
        data.data.symbol &&
        typeof data.data.symbol === "string" &&
        data.data.symbol.trim() !== ""
      ) {
        return [data.data];
      }
    }

    return [];
  };

  const normalizedData = getNormalizedData();
  const hasData = normalizedData.length > 0;

  const renderCryptoItem = ({ item, index }: { item: any; index: number }) => {
    // Validate item before rendering
    if (!item || !item.symbol) {
      return null;
    }

    const displaySymbol = item.symbol || "N/A";
    const displayName = item.name || displaySymbol;
    const imageUri = item.image || "";

    return (
      <TouchableOpacity
        onPress={() => handleCurrencySelection(item)}
        disabled={selectedItemId !== null}
        style={[
          {
            width: "100%",
            borderRadius: theme.spacing.spacing[3],
            backgroundColor: theme.colors.palette.grey150,
            padding: 10,
            flexDirection: "row",
            marginVertical: 5,
            borderColor: theme.colors.palette.grey300,
            borderWidth: 1 / 2,
            alignItems: "center",
          },
        ]}
      >
        {imageUri && imageUri.toLowerCase().endsWith(".svg") ? (
          <SvgUri uri={imageUri} width={30} height={30} />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 30, height: 30 }}
            resizeMode="contain"
            onError={() => {
              // Handle image load error silently
              console.log("Failed to load image for:", displaySymbol);
            }}
          />
        ) : (
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.palette.grey300,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomText variant="caption" color={theme.colors.palette.grey700}>
              {displaySymbol.slice(0, 2).toUpperCase()}
            </CustomText>
          </View>
        )}
        <View
          style={[
            {
              flex: 1,
              paddingHorizontal: 10,
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
        >
          <View style={[{ flex: 1 }]}>
            <CustomText variant={"subtitle2"} numberOfLines={1}>
              {displaySymbol}
            </CustomText>
            <CustomText variant={"caption"} numberOfLines={1}>
              {displayName.length > 3 ? displayName.slice(0, 3) : displayName}
            </CustomText>
          </View>
          {selectedItemId === item.symbol && (
            <ActivityIndicator
              size="small"
              color={theme.colors.palette.green700}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color={theme.colors.palette.green700} />
      <CustomText
        variant="body2"
        color={theme.colors.palette.grey700}
        style={styles.emptyText}
      >
        Loading assets...
      </CustomText>
    </View>
  );

  // Render error state
  const renderErrorState = () => {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Failed to load assets. Please try again.";

    return (
      <View style={styles.emptyContainer}>
        <CustomText
          variant="subtitle1"
          fontWeight="semiBold"
          color={theme.colors.palette.grey900}
          style={styles.emptyTitle}
        >
          Unable to Load Assets
        </CustomText>
        <CustomText
          variant="body2"
          color={theme.colors.palette.grey700}
          style={styles.emptyText}
        >
          {errorMessage}
        </CustomText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <CustomText
            variant="body2"
            fontWeight="semiBold"
            color={theme.colors.palette.white}
          >
            Retry
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <CustomText
        variant="subtitle1"
        fontWeight="semiBold"
        color={theme.colors.palette.grey900}
        style={styles.emptyTitle}
      >
        No Assets Available
      </CustomText>
      <CustomText
        variant="body2"
        color={theme.colors.palette.grey700}
        style={styles.emptyText}
      >
        There are no crypto assets available at the moment. Please check back later.
      </CustomText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => refetch()}
      >
        <CustomText
          variant="body2"
          fontWeight="semiBold"
          color={theme.colors.palette.white}
        >
          Refresh
        </CustomText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer safeArea={true} paddingHorizontal={0}>
      <HeaderTitle title="Crypto Wallet" leftIcon={"true"} />
      <View style={[styles.container]}>
        {/* Crypto List */}
        <View style={styles.listContainer}>
          {/* Loading State */}
          {(isFetching || isPending) && !isFetched && renderLoadingState()}

          {/* Error State */}
          {isError && !isFetching && renderErrorState()}

          {/* Success State with Data */}
          {isSuccess && hasData && !isFetching && (
            <FlatList
              data={normalizedData}
              showsVerticalScrollIndicator={false}
              renderItem={renderCryptoItem}
              keyExtractor={(item, index) =>
                `${item?.symbol || "item"}-${index}`
              }
              refreshing={isFetching}
              onRefresh={() => refetch()}
              ListEmptyComponent={renderEmptyState()}
            />
          )}

          {/* Success State without Data */}
          {isSuccess && !hasData && !isFetching && renderEmptyState()}

          {/* Initial State - Not fetched yet and not loading */}
          {!isFetched && !isFetching && !isError && renderLoadingState()}
        </View>
      </View>
    </ScreenContainer>
  );
};

export default CryptoList;

const cryptoListStyles = (theme: Theme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.overlay,
      paddingTop: theme.spacing.spacing[32],
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopLeftRadius: theme.spacing.spacing.lg,
      borderTopRightRadius: theme.spacing.spacing.lg,
      paddingHorizontal: theme.spacing.spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
    },
    closeButton: {
      padding: theme.spacing.spacing.xs,
    },
    tabContainer: {
      paddingVertical: theme.spacing.spacing.md,
    },
    listContainer: {
      flex: 1,
      paddingVertical: theme.spacing.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[8],
      paddingHorizontal: theme.spacing.spacing[4],
    },
    emptyTitle: {
      marginBottom: theme.spacing.spacing[2],
      textAlign: "center",
    },
    emptyText: {
      textAlign: "center",
      marginBottom: theme.spacing.spacing[4],
      lineHeight: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: theme.spacing.spacing[6],
      paddingVertical: theme.spacing.spacing[3],
      borderRadius: theme.spacing.spacing[3],
      marginTop: theme.spacing.spacing[2],
    },
  });
