import React, { useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import { LocationCardItem } from "../locationFinder.types";
import { LocationDetailCard, type LocationCardFooterMode } from "./LocationDetailCard";

type Props = {
  locations: LocationCardItem[];
  selectedId?: string | null;
  onSelect: (item: LocationCardItem) => void;
  onGenerateBarcode?: (item: LocationCardItem) => void;
  onViewMoreDetails?: (item: LocationCardItem) => void;
  footerMode?: LocationCardFooterMode;
};

const CARD_WIDTH = 290;

export const LocationCarousel: React.FC<Props> = ({
  locations,
  selectedId,
  onSelect,
  onGenerateBarcode,
  onViewMoreDetails,
  footerMode = "generate_barcode",
}) => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LocationCardItem>) => (
      <LocationDetailCard
        item={item}
        selected={selectedId === item.id}
        onPress={onSelect}
        onGenerateBarcode={onGenerateBarcode}
        onViewMoreDetails={onViewMoreDetails}
        footerMode={footerMode}
      />
    ),
    [footerMode, onGenerateBarcode, onSelect, onViewMoreDetails, selectedId]
  );

  const keyExtractor = useCallback((item: LocationCardItem) => item.id, []);

  return (
    <FlatList
      data={locations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContent}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + theme.spacing.md}
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={6}
    />
  );
};
