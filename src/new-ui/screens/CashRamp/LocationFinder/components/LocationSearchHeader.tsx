import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { AppIcon } from "@new-ui/assets/svgs";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import type { PlacePrediction } from "../googlePlaces";

type Props = {
  search: string;
  onChangeSearch: (value: string) => void;
  onBack: () => void;
  onPressMyLocation: () => void;
  predictions: PlacePrediction[];
  onSelectPrediction: (item: PlacePrediction) => void;
  isPlacesLoading: boolean;
  placesError?: string | null;
  placesSearchEnabled: boolean;
};

export const LocationSearchHeader: React.FC<Props> = ({
  search,
  onChangeSearch,
  onBack,
  onPressMyLocation,
  predictions,
  onSelectPrediction,
  isPlacesLoading,
  placesError,
  placesSearchEnabled,
}) => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);

  const trimmed = search.trim();
  const showList =
    placesSearchEnabled &&
    trimmed.length >= 1 &&
    (isPlacesLoading || predictions.length > 0 || Boolean(placesError));

  const renderPrediction = useCallback(
    ({ item }: ListRenderItemInfo<PlacePrediction>) => (
      <Pressable onPress={() => onSelectPrediction(item)} style={styles.suggestionRow}>
        <CustomText variant="body" style={styles.suggestionMain}>
          {item.mainText}
        </CustomText>
        {item.secondaryText ? (
          <CustomText variant="bodySmall" style={styles.suggestionSub} numberOfLines={2}>
            {item.secondaryText}
          </CustomText>
        ) : null}
      </Pressable>
    ),
    [onSelectPrediction, styles.suggestionMain, styles.suggestionRow, styles.suggestionSub]
  );

  const keyExtractor = useCallback((item: PlacePrediction) => item.placeId, []);

  return (
    <View style={styles.searchHeaderOuter}>
      <View style={styles.searchHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <AppIcon.ArrowLeft width={22} height={22} color={theme.colors.text} />
        </Pressable>
        <View style={styles.searchInputWrap}>
          <TextInput
            value={search}
            onChangeText={onChangeSearch}
            placeholder="Address or place"
            placeholderTextColor={theme.colors.greyDark}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={onPressMyLocation}
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityLabel="Center map on current location"
        >
          <CustomText variant="body" color={theme.colors.text} style={{ fontSize: 18 }}>
            ⌖
          </CustomText>
        </Pressable>
      </View>

      {showList ? (
        <View style={styles.suggestionsWrap}>
          {isPlacesLoading ? (
            <View style={{ paddingVertical: theme.spacing.md, alignItems: "center" }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : predictions.length > 0 ? (
            <FlatList
              data={predictions}
              renderItem={renderPrediction}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            />
          ) : placesError ? (
            <View style={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
              <CustomText variant="bodySmall" color={theme.colors.text}>
                {placesError}
              </CustomText>
            </View>
          ) : null}
        </View>
      ) : null}

      {placesError && !showList ? (
        <View style={styles.placesErrorText}>
          <CustomText variant="bodySmall" color={theme.colors.onPrimary}>
            {placesError}
          </CustomText>
        </View>
      ) : null}
    </View>
  );
};
