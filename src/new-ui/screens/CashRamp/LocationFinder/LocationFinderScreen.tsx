import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useNearbyCashLocations } from "query/hooks/useCashRamp";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import {
  CashRampLocationFinderParams,
  LocationCardItem,
} from "./locationFinder.types";
import { mapMarkerLabel } from "./locationFinder.utils";
import { LocationSearchHeader } from "./components/LocationSearchHeader";
import { LocationCarousel } from "./components/LocationCarousel";
import { useCashRampLocationMapSearch } from "./useCashRampLocationMapSearch";

import { useSelector } from "react-redux";
import CashBuyPurchaseInstructionsModal from "../CashBuyPurchaseInstructionsModal";
import {
  getProfileResidentialStateCode,
  isCashRampStoreStateAllowed,
} from "./cashRampProfileState";
import { hasCashBuyLoadInstructionsAck } from "../cashBuyLoadInstructionsAck";
import {
  CASH_RAMP_LOCATION_UNAVAILABLE_BODY,
  CASH_RAMP_LOCATION_UNAVAILABLE_TITLE,
} from "../cashRampLocationMessages";

const DEFAULT_RADIUS = 10;
const DEFAULT_LIMIT = 20;

const LocationFinderScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, CashRampLocationFinderParams>, string>>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const pendingStoreRef = useRef<LocationCardItem | null>(null);

  const userData = useSelector(
    (s: { authenticationSlice?: { userData?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.userData ?? null
  );
  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );
  const cashBuyUserId =
    (userData?.id as string | number | undefined) ??
    (userData?.user_id as string | number | undefined) ??
    null;

  const {
    queryCenter,
    mapRef,
    searchInput,
    setSearchInput,
    predictions,
    isPredictionsLoading,
    placesClientError,
    selectPrediction,
    goToMyLocation,
    dismissSuggestions,
    placesSearchEnabled,
    suggestionsOpen,
  } = useCashRampLocationMapSearch();

  const { data, isPending, isError, isFetching } = useNearbyCashLocations({
    latitude: queryCenter.latitude,
    longitude: queryCenter.longitude,
    radius: DEFAULT_RADIUS,
    limit: DEFAULT_LIMIT,
  });

  useEffect(() => {
    setSelectedId(null);
  }, [queryCenter.latitude, queryCenter.longitude]);

  const rawRows = data?.data?.locations ?? [];

  const mappedLocations = useMemo<LocationCardItem[]>(
    () =>
      rawRows.map((item, index) => ({
        ...item,
        markerLabel: mapMarkerLabel(index),
      })),
    [rawRows]
  );

  const selectedLocation = useMemo(() => {
    if (!mappedLocations.length) return null;
    if (!selectedId) return mappedLocations[0];
    return mappedLocations.find((x) => x.id === selectedId) || mappedLocations[0];
  }, [mappedLocations, selectedId]);

  const handleSelect = useCallback((item: LocationCardItem) => {
    setSelectedId(item.id);
  }, []);

  const navigateToCashBuyBarcode = useCallback(
    (item: LocationCardItem) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_RAMP_BARCODE as never, {
        amount: route.params?.amount ?? 0,
        fiatCurrencyCode: route.params?.fiatCurrencyCode ?? "USD",
        cryptoCurrencyCode: route.params?.cryptoCurrencyCode ?? "SOL",
        cashRampFlow: "buy" as const,
        chain: route.params?.chain ?? "ETH",
        sourceWalletAddress: route.params?.sourceWalletAddress,
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
          imageUrl: item.imageUrl,
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

  const openLocationUnavailableError = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR, {
      title: CASH_RAMP_LOCATION_UNAVAILABLE_TITLE,
      description: CASH_RAMP_LOCATION_UNAVAILABLE_BODY,
      primaryButtonLabel: "I Understand",
      dismissAction: "goBack",
    });
  }, [navigation]);

  const openConsentFailureError = useCallback(
    (title: string, description: string) => {
      navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR, {
        title,
        description,
        primaryButtonLabel: "Close",
        dismissAction: "goBack",
      });
    },
    [navigation]
  );

  const handleGenerateBarcode = useCallback(
    (item: LocationCardItem) => {
      const profileState = getProfileResidentialStateCode(userData, usersMe);
      const { allowed } = isCashRampStoreStateAllowed(item.state, profileState);
      if (!allowed) {
        openLocationUnavailableError();
        return;
      }
      if (hasCashBuyLoadInstructionsAck(cashBuyUserId)) {
        navigateToCashBuyBarcode(item);
        return;
      }
      pendingStoreRef.current = item;
      setInstructionsModalOpen(true);
    },
    [
      cashBuyUserId,
      navigateToCashBuyBarcode,
      openLocationUnavailableError,
      userData,
      usersMe,
    ]
  );

  const closeInstructionsModal = useCallback(() => {
    setInstructionsModalOpen(false);
    pendingStoreRef.current = null;
  }, []);

  const onPurchaseInstructionsConsented = useCallback(() => {
    setInstructionsModalOpen(false);
    const item = pendingStoreRef.current;
    pendingStoreRef.current = null;
    if (item) {
      navigateToCashBuyBarcode(item);
    }
  }, [navigateToCashBuyBarcode]);

  const initialRegionRef = useRef({
    latitude: queryCenter.latitude,
    longitude: queryCenter.longitude,
    latitudeDelta: 0.12,
    longitudeDelta: 0.08,
  });

  const showEmptyList = !isPending && !isError && mappedLocations.length === 0;

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom"]}
      backgroundColor={theme.colors.black}
      contentStyle={{ flex: 1 }}
      statusBarStyle="light-content"
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegionRef.current}
      >
        {mappedLocations.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.coordinates.latitude,
              longitude: item.coordinates.longitude,
            }}
            title={item.description || "Store"}
            description={item.address || ""}
            onPress={() => handleSelect(item)}
            tracksViewChanges={false}
          >
            <View style={styles.markerWrap}>
              <View style={styles.markerDot}>
                <CustomText variant="bodySmall" color={theme.colors.white}>
                  {item.markerLabel}
                </CustomText>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <Pressable
        onPress={dismissSuggestions}
        style={[
          StyleSheet.absoluteFillObject,
          {
            zIndex: 50,
            backgroundColor: suggestionsOpen ? "rgba(0,0,0,0.28)" : "transparent",
          },
        ]}
        pointerEvents={suggestionsOpen ? "auto" : "none"}
      />

      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, elevation: 12 }}
        pointerEvents="box-none"
      >
        <LocationSearchHeader
          search={searchInput}
          onChangeSearch={setSearchInput}
          onBack={() => navigation.goBack()}
          onPressMyLocation={goToMyLocation}
          predictions={predictions}
          onSelectPrediction={selectPrediction}
          isPlacesLoading={isPredictionsLoading}
          placesError={placesClientError}
          placesSearchEnabled={placesSearchEnabled}
        />
      </View>

      {isFetching && !isPending ? (
        <View style={styles.fetchingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      ) : null}

      {isPending ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <CustomText variant="body" color={theme.colors.white}>
            Unable to load nearby stores.
          </CustomText>
        </View>
      ) : showEmptyList ? (
        <View style={styles.emptyNearbyWrap}>
          <CustomText variant="body" color={theme.colors.white} style={{ textAlign: "center" }}>
            No cash locations near this area.
          </CustomText>
        </View>
      ) : (
        <View style={styles.carouselWrap}>
          <LocationCarousel
            locations={mappedLocations}
            selectedId={selectedLocation?.id}
            onSelect={handleSelect}
            onGenerateBarcode={handleGenerateBarcode}
          />
        </View>
      )}
      <CashBuyPurchaseInstructionsModal
        visible={instructionsModalOpen}
        userId={cashBuyUserId}
        onClose={closeInstructionsModal}
        onConsented={onPurchaseInstructionsConsented}
        onConsentApiFailure={openConsentFailureError}
      />
    </ScreenWrapper>
  );
};

export default LocationFinderScreen;
