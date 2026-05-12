import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { useNearbyCashLocations } from "query/hooks/useCashRamp";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import { CashRampLocationFinderParams, LocationCardItem } from "./locationFinder.types";
import { getInitialCoordinates, mapMarkerLabel } from "./locationFinder.utils";
import { LocationSearchHeader } from "./components/LocationSearchHeader";
import { LocationCarousel } from "./components/LocationCarousel";

const SELL_RADIUS = 10;
const SELL_LIMIT = 5;
const SELL_PROVIDERS = "ALLPOINT";

/** Sell (crypto → cash at ATM): same map/carousel as buy flow, ALLPOINT nearby API, code label instead of barcode. */
const SellCashRampLocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, CashRampLocationFinderParams>, string>>();

  console.log("route.params =>", JSON.stringify(route.params, null, 2));
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const center = getInitialCoordinates();

  const { data, isPending, isError } = useNearbyCashLocations({
    latitude: center.latitude,
    longitude: center.longitude,
    radius: SELL_RADIUS,
    limit: SELL_LIMIT,
    providers: SELL_PROVIDERS,
  });

  const mappedLocations = useMemo<LocationCardItem[]>(() => {
    const rows = data?.data?.locations ?? [];
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = !normalizedSearch
      ? rows
      : rows.filter((item) =>
          `${item.description || ""} ${item.address || ""} ${item.city || ""}`
            .toLowerCase()
            .includes(normalizedSearch)
        );
    return filtered.map((item, index) => ({
      ...item,
      markerLabel: mapMarkerLabel(index),
    }));
  }, [data?.data?.locations, search]);

  const selectedLocation = useMemo(() => {
    if (!mappedLocations.length) return null;
    if (!selectedId) return mappedLocations[0];
    return mappedLocations.find((x) => x.id === selectedId) || mappedLocations[0];
  }, [mappedLocations, selectedId]);

  const handleSelect = useCallback((item: LocationCardItem) => {
    setSelectedId(item.id);
  }, []);

  const handleViewMoreDetails = useCallback(
    (item: LocationCardItem) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_BARCODE as never, {
        amount: route.params?.amount ?? 0,
        fiatCurrencyCode: route.params?.fiatCurrencyCode ?? "USD",
        cryptoCurrencyCode: route.params?.cryptoCurrencyCode ?? "SOL",
        cashRampFlow: "sell" as const,
        chain: route.params?.chain ?? "ETH",
        sourceWalletAddress: route.params?.sourceWalletAddress ?? "",
        location: {
          id: item.id,
          provider: item.provider,
          description: item.description,
          address: item.address,
          city: item.city,
          state: item.state,
          zipCode: item.zipCode,
          lineOfSightDistance: item.lineOfSightDistance,
          lineOfSightMetric: item.lineOfSightMetric,
          locationReference: item.locationReference,
        },
      } as never);
    },
    [
      navigation,
      route.params?.amount,
      route.params?.chain,
      route.params?.cryptoCurrencyCode,
      route.params?.fiatCurrencyCode,
      route.params?.sourceWalletAddress,
    ]
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.black}
      contentStyle={{ flex: 1 }}
      statusBarStyle="light-content"
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation?.coordinates?.latitude ?? center.latitude,
          longitude: selectedLocation?.coordinates?.longitude ?? center.longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.08,
        }}
      >
        {mappedLocations.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.coordinates.latitude,
              longitude: item.coordinates.longitude,
            }}
            title={item.description || "ATM"}
            description={item.address || ""}
            onPress={() => handleSelect(item)}
            tracksViewChanges={false}
          >
            <View style={styles.markerWrap}>
              <View style={styles.markerDot}>
                <CustomText variant="body2" color={theme.colors.white}>
                  {item.markerLabel}
                </CustomText>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <LocationSearchHeader search={search} onChangeSearch={setSearch} onBack={() => navigation.goBack()} />

      {isPending ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <CustomText variant="body" color={theme.colors.white}>
            Unable to load nearby ATMs.
          </CustomText>
        </View>
      ) : (
        <View style={styles.carouselWrap}>
          <LocationCarousel
            locations={mappedLocations}
            selectedId={selectedLocation?.id}
            onSelect={handleSelect}
            onViewMoreDetails={handleViewMoreDetails}
            footerMode="sell_code"
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default SellCashRampLocationScreen;
