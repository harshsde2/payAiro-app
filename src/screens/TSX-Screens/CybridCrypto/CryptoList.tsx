import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgUri } from "react-native-svg";
import { useGetCrypto, useSelectCryptoCurrency } from "query/hooks";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setTotalDisbursable, setSelectedCurrency } from "redux/slices/authenticationSlice";
import { formatAtomicToDecimal, getAssetDecimals } from "utils/unitConversion";

const CryptoList = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const styles = cryptoListStyles(theme);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data, isPending, isFetched, isSuccess, isError, isFetching } =
    useGetCrypto();

  const { selectCurrency } = useSelectCryptoCurrency();

  const handleCurrencySelection = async (item: any) => {
    try {
      setSelectedItemId(item.symbol);
      const result = await selectCurrency(item.symbol);

      console.log("result", result);
      // Store the complete currency object in Redux
      dispatch(setSelectedCurrency(item));
      
      // Convert atomic balance (e.g., wei) to human-readable using asset decimals
      const decimals = getAssetDecimals(item?.symbol);
      console.log("decimals", decimals);
      const humanReadable = formatAtomicToDecimal(result?.data?.platform_balance, decimals);
      dispatch(setTotalDisbursable(humanReadable));
      
      navigation.goBack();
    } catch (error) {
      console.log("Error selecting currency:", error);
    } finally {
      setSelectedItemId(null);
    }
  };

  const renderCryptoItem = ({ item, index }: { item: any; index: number }) => (
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
      {item?.logo?.toLowerCase?.().endsWith(".svg") ? (
        <SvgUri uri={item?.logo} width={30} height={30} />
      ) : (
        <Image
          source={{ uri: item?.logo }}
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
        />
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
          <CustomText variant={"subtitle2"}>{item?.symbol}</CustomText>
          <CustomText variant={"caption"}>
            {item?.symbol.slice(0, 3)}
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

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={[styles.mainContainer]}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={[styles.container]}
      >
        {/* Header */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.header}
        >
          <View
            style={[
              {
                height: 5,
                backgroundColor: "black",
                width: 80,
                borderRadius: theme.spacing.spacing[1],
              },
            ]}
          />
        </TouchableOpacity>

        {/* Crypto List */}
        <View style={styles.listContainer}>
          {isFetching && (
            <View
              style={[
                { flex: 1, justifyContent: "center", alignItems: "center" },
              ]}
            >
              <CustomText variant="body2">Please wait....</CustomText>
            </View>
          )}

          {isSuccess && (
            <FlatList
              data={data?.data}
              showsVerticalScrollIndicator={false}
              renderItem={renderCryptoItem}
              keyExtractor={(item, index) => `${item?.symbol}-${index}`}
            />
          )}
        </View>
      </Pressable>
    </Pressable>
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
    },
  });
