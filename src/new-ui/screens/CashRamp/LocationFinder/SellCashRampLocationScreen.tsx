import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomText from "@new-ui/components/common-components/CustomText";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { useNearbyCashLocations } from "query/hooks/useCashRamp";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";
import { LocationCardItem } from "./locationFinder.types";
import { mapMarkerLabel } from "./locationFinder.utils";
import { LocationSearchHeader } from "./components/LocationSearchHeader";
import { LocationCarousel } from "./components/LocationCarousel";
import { useCashRampLocationMapSearch } from "./useCashRampLocationMapSearch";
import {
  getProfileResidentialStateCode,
  isCashRampStoreStateAllowed,
} from "./cashRampProfileState";
import {
  CASH_RAMP_LOCATION_UNAVAILABLE_BODY,
  CASH_RAMP_LOCATION_UNAVAILABLE_TITLE,
} from "../cashRampLocationMessages";
import type { SellCashRampEntryParams } from "../Sell/sellFlow.types";
import { locationItemToSnapshot } from "../Sell/sellFlow.types";

const SELL_RADIUS = 10;
const SELL_LIMIT = 5;
const SELL_PROVIDERS = "ALLPOINT";

/** Sell (crypto → cash at ATM): map first, then enter amount. */
const SellCashRampLocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<Record<string, SellCashRampEntryParams>, string>>();
  const entry = route.params;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const userData = useSelector(
    (s: { authenticationSlice?: { userData?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.userData ?? null
  );
  const usersMe = useSelector(
    (s: { authenticationSlice?: { usersMe?: Record<string, unknown> | null } }) =>
      s.authenticationSlice?.usersMe ?? null
  );

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
    isResolvingInitialCenter,
    suggestionsOpen,
  } = useCashRampLocationMapSearch({ usersMe });

  const { data, isPending, isError, isFetching } = useNearbyCashLocations({
    latitude: queryCenter.latitude,
    longitude: queryCenter.longitude,
    radius: SELL_RADIUS,
    limit: SELL_LIMIT,
    providers: SELL_PROVIDERS,
    enabled: !isResolvingInitialCenter,
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

  const navigateToSellEnterAmount = useCallback(
    (item: LocationCardItem) => {
      if (!entry) return;
      navigation.navigate(NAVIGATION_SCREENS.NEW_CASH_SELL_ENTER_AMOUNT as never, {
        ...entry,
        location: locationItemToSnapshot(item),
      } as never);
    },
    [entry, navigation]
  );

  const openLocationUnavailableError = useCallback(() => {
    navigation.navigate(NAVIGATION_SCREENS.NEW_COMMON_ERROR, {
      title: CASH_RAMP_LOCATION_UNAVAILABLE_TITLE,
      description: CASH_RAMP_LOCATION_UNAVAILABLE_BODY,
      primaryButtonLabel: "I Understand",
      dismissAction: "goBack",
    });
  }, [navigation]);

  const handleSellForCash = useCallback(
    (item: LocationCardItem) => {
      const profileState = getProfileResidentialStateCode(userData, usersMe);
      const { allowed } = isCashRampStoreStateAllowed(item.state, profileState);
      if (!allowed) {
        openLocationUnavailableError();
        return;
      }
      navigateToSellEnterAmount(item);
    },
    [navigateToSellEnterAmount, openLocationUnavailableError, userData, usersMe]
  );

  const initialRegionRef = useRef({
    latitude: queryCenter.latitude,
    longitude: queryCenter.longitude,
    latitudeDelta: 0.12,
    longitudeDelta: 0.08,
  });

  const showEmptyList =
    !isPending && !isResolvingInitialCenter && !isError && mappedLocations.length === 0;

  if (!entry) {
    return (
      <ScreenWrapper safeArea backgroundColor={theme.colors.black}>
        <View style={styles.stateWrap}>
          <CustomText variant="body" color={theme.colors.white}>
            Missing sell details. Go back and try again.
          </CustomText>
        </View>
      </ScreenWrapper>
    );
  }

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
            title={item.description || "ATM"}
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

      {isFetching && !isPending && !isResolvingInitialCenter ? (
        <View style={styles.fetchingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      ) : null}

      {isPending || isResolvingInitialCenter ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <CustomText variant="body" color={theme.colors.white}>
            Unable to load nearby ATMs.
          </CustomText>
        </View>
      ) : showEmptyList ? (
        <View style={styles.emptyNearbyWrap}>
          <CustomText variant="body" color={theme.colors.white} style={{ textAlign: "center" }}>
            No ATMs near this area.
          </CustomText>
        </View>
      ) : (
        <View style={styles.carouselWrap}>
          <LocationCarousel
            locations={mappedLocations}
            selectedId={selectedLocation?.id}
            onSelect={handleSelect}
            onViewMoreDetails={handleSellForCash}
            footerMode="sell_code"
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default SellCashRampLocationScreen;
