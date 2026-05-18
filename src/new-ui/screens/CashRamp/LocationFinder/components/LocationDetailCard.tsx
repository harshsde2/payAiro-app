import React, { memo } from "react";
import { Pressable, View } from "react-native";
import Button from "@new-ui/components/common-components/layout/Button";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import { LocationCardItem } from "../locationFinder.types";
import {
  buildAddressLine,
  formatDistance,
  formatLocationHours,
  formatProviderLabel,
} from "../locationFinder.utils";

export type LocationCardFooterMode = "generate_barcode" | "sell_code";

type Props = {
  item: LocationCardItem;
  selected: boolean;
  onPress: (item: LocationCardItem) => void;
  onGenerateBarcode?: (item: LocationCardItem) => void;
  /** Sell map: opens unified barcode-style screen with full details. */
  onViewMoreDetails?: (item: LocationCardItem) => void;
  footerMode?: LocationCardFooterMode;
};

const LocationDetailCardComponent: React.FC<Props> = ({
  item,
  selected,
  onPress,
  onGenerateBarcode,
  onViewMoreDetails,
  footerMode = "generate_barcode",
}) => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);
  const distanceText = formatDistance(item.lineOfSightDistance, item.lineOfSightMetric);
  const address = buildAddressLine(item);
  const hoursText = formatLocationHours(item.hours);

  const cardStyle = [styles.locationCard, selected && styles.locationCardSelected];

  if (footerMode === "sell_code") {
    return (
      <View style={cardStyle}>
        <Pressable onPress={() => onPress(item)}>
          <View style={styles.locationCardHeader}>
            <CustomText variant="h4" color={theme.colors.white} fontWeight="semiBold">
              {item.markerLabel}. {item.description || "Store"}
            </CustomText>
            {!!distanceText && (
              <CustomText variant="body" color={theme.colors.white}>
                {distanceText}
              </CustomText>
            )}
          </View>
          <CustomText variant="body2" color={theme.colors.white} style={styles.locationAddress}>
            {address}
          </CustomText>
        </Pressable>
        {onViewMoreDetails ? (
          <View style={styles.sellMoreDetailsWrap}>
            <Button onPress={() => onViewMoreDetails(item)}>Sell for Cash</Button>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable onPress={() => onPress(item)} style={cardStyle}>
      <View style={styles.locationCardHeader}>
        <CustomText variant="h4" color={theme.colors.white} fontWeight="semiBold">
          {item.markerLabel}. {item.description || "Store"}
        </CustomText>
        {!!distanceText && (
          <CustomText variant="body" color={theme.colors.white}>
            {distanceText}
          </CustomText>
        )}
      </View>

      <CustomText variant="body" color={theme.colors.white}>
        {formatProviderLabel(item.provider)}
      </CustomText>
      <CustomText variant="body2" color={theme.colors.white} style={styles.locationAddress}>
        {address}
      </CustomText>
      {!!hoursText && (
        <CustomText
          variant="body2"
          color={theme.colors.white}
          style={styles.locationHours}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {hoursText}
        </CustomText>
      )}

      <Button onPress={() => onGenerateBarcode?.(item)}>Generate Barcode</Button>
    </Pressable>
  );
};

export const LocationDetailCard = memo(LocationDetailCardComponent);
