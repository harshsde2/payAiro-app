import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";
import MapView from "react-native-maps";
import Geolocation, { type GeolocationResponse } from "@react-native-community/geolocation";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Config from "react-native-config";
import { showError } from "utils/toast";
import {
  getInitialCoordinates,
  getUsStateCenterCoordinates,
  parseLegalIdentityForGeocode,
} from "./locationFinder.utils";
import {
  fetchPlaceDetailsLatLng,
  fetchPlacePredictions,
  geocodeProfileLegalIdentity,
  newPlacesSessionToken,
  type PlacePrediction,
} from "./googlePlaces";

const DEBOUNCE_MS = 320;
const USERS_ME_WAIT_MS = 2500;

const REGION_DELTA = { latitudeDelta: 0.12, longitudeDelta: 0.08 };

type MapCoordinate = { latitude: number; longitude: number };

export type UseCashRampLocationMapSearchOptions = {
  /** Redux `usersMe`; when null, initial center waits briefly for `/users/me/` to load. */
  usersMe?: unknown | null;
};

function getPlacesRestApiKey(): string | undefined {
  const raw =
    Platform.OS === "ios"
      ? Config.GOOGLE_MAPS_API_KEY_IOS || Config.GOOGLE_MAPS_API_KEY
      : Config.GOOGLE_MAPS_API_KEY_ANDROID || Config.GOOGLE_MAPS_API_KEY;
  const t = (raw || "").trim();
  return t || undefined;
}

async function resolveDeviceLocation(silent: boolean): Promise<MapCoordinate | null> {
  const permission =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  const result = await request(permission);
  if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
    if (!silent) {
      showError("Permission needed", "Location permission is required to use your current location.");
    }
    return null;
  }
  try {
    const pos = await new Promise<GeolocationResponse>((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 18000,
        maximumAge: 10000,
      });
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    if (!silent) {
      showError("Location unavailable", "Unable to read your current location.");
    }
    return null;
  }
}

export function useCashRampLocationMapSearch(options?: UseCashRampLocationMapSearchOptions) {
  const usersMe = options?.usersMe;
  const profileGeocodeInput = useMemo(
    () => parseLegalIdentityForGeocode(usersMe),
    [usersMe]
  );

  const fallback = useMemo(() => getInitialCoordinates(), []);
  const [queryCenter, setQueryCenter] = useState(fallback);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);
  const [placesClientError, setPlacesClientError] = useState<string | null>(null);
  const [isResolvingInitialCenter, setIsResolvingInitialCenter] = useState(true);

  const mapRef = useRef<MapView>(null);
  const sessionTokenRef = useRef(newPlacesSessionToken());
  const predictionsAbortRef = useRef<AbortController | null>(null);
  const detailsAbortRef = useRef<AbortController | null>(null);
  const initialCenterAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstPanRef = useRef(true);
  const profileGeocodeSucceededRef = useRef(false);
  const fallbackCenterAppliedRef = useRef(false);
  const usersMeRef = useRef(usersMe);
  usersMeRef.current = usersMe;

  const apiKey = getPlacesRestApiKey();

  const animateTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        ...REGION_DELTA,
      },
      420
    );
  }, []);

  useEffect(() => {
    if (skipFirstPanRef.current) {
      skipFirstPanRef.current = false;
      return;
    }
    animateTo(queryCenter.latitude, queryCenter.longitude);
  }, [queryCenter.latitude, queryCenter.longitude, animateTo]);

  useEffect(() => {
    if (usersMe == null || profileGeocodeSucceededRef.current) return;

    let cancelled = false;
    initialCenterAbortRef.current?.abort();
    const ac = new AbortController();
    initialCenterAbortRef.current = ac;

    setIsResolvingInitialCenter(true);

    void (async () => {
      try {
        const input = profileGeocodeInput;
        if (input && apiKey) {
          const geo = await geocodeProfileLegalIdentity({
            profile: input,
            apiKey,
            signal: ac.signal,
          });
          if (ac.signal.aborted || cancelled) return;
          if (geo) {
            profileGeocodeSucceededRef.current = true;
            setQueryCenter({ latitude: geo.lat, longitude: geo.lng });
            if (__DEV__) {
              console.log(
                "[LocationFinder] Map center from profile address:",
                geo.lat,
                geo.lng,
                input.addressLine
              );
            }
            return;
          }
          if (__DEV__) {
            console.warn(
              "[LocationFinder] Profile geocode failed; trying device location.",
              input.addressLine
            );
          }
        }

        if (usersMe != null && !fallbackCenterAppliedRef.current) {
          await applyFallbackCenter(ac.signal, () => cancelled);
        }
      } finally {
        if (!ac.signal.aborted && !cancelled) {
          setIsResolvingInitialCenter(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [usersMe, profileGeocodeInput, apiKey]);

  useEffect(() => {
    if (usersMe != null || profileGeocodeSucceededRef.current || fallbackCenterAppliedRef.current) {
      return;
    }

    let cancelled = false;
    const waitForUsersMeTimer = setTimeout(() => {
      if (cancelled || usersMeRef.current != null || profileGeocodeSucceededRef.current) return;
      void applyFallbackCenter(undefined, () => cancelled);
    }, USERS_ME_WAIT_MS);

    return () => {
      cancelled = true;
      clearTimeout(waitForUsersMeTimer);
    };
  }, [usersMe, apiKey]);

  async function applyFallbackCenter(
    signal: AbortSignal | undefined,
    isCancelled: () => boolean
  ) {
    if (fallbackCenterAppliedRef.current || profileGeocodeSucceededRef.current) return;

    setIsResolvingInitialCenter(true);
    try {
      let center: MapCoordinate | null = null;
      const device = await resolveDeviceLocation(true);
      if (signal?.aborted || isCancelled()) return;
      if (device) center = device;
      if (!center) {
        const stateCenter = getUsStateCenterCoordinates(profileGeocodeInput?.stateCode);
        center = stateCenter ?? getInitialCoordinates();
      }
      if (!profileGeocodeSucceededRef.current && !isCancelled()) {
        fallbackCenterAppliedRef.current = true;
        setQueryCenter(center);
      }
    } finally {
      if (!signal?.aborted && !isCancelled()) {
        setIsResolvingInitialCenter(false);
      }
    }
  }

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setPlacesClientError(null);
  }, []);

  const bumpSession = useCallback(() => {
    sessionTokenRef.current = newPlacesSessionToken();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = searchInput.trim();
    if (q.length < 1 || !apiKey) {
      setPredictions([]);
      setIsPredictionsLoading(false);
      if (q.length >= 1 && !apiKey) {
        setPlacesClientError(
          "Add GOOGLE_MAPS_API_KEY_IOS or GOOGLE_MAPS_API_KEY_ANDROID (or GOOGLE_MAPS_API_KEY) to .env so place search can run, then rebuild the app."
        );
      } else {
        setPlacesClientError(null);
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      predictionsAbortRef.current?.abort();
      const ac = new AbortController();
      predictionsAbortRef.current = ac;
      setIsPredictionsLoading(true);
      setPlacesClientError(null);

      void (async () => {
        try {
          const res = await fetchPlacePredictions({
            input: q,
            apiKey,
            sessionToken: sessionTokenRef.current,
            signal: ac.signal,
          });
          if (ac.signal.aborted) return;

          const hasPredictions = res.predictions.length > 0;
          const okEmpty = res.status === "ZERO_RESULTS" || res.status === "SKIP";
          if (!hasPredictions && !okEmpty && res.errorMessage) {
            setPlacesClientError(res.errorMessage);
            setPredictions([]);
          } else if (!hasPredictions && !okEmpty) {
            setPlacesClientError(
              "No suggestions returned. In Google Cloud, enable Places API (New) and/or Places API for this key."
            );
            setPredictions([]);
          } else {
            setPlacesClientError(null);
            setPredictions(res.predictions);
          }
        } catch (e: unknown) {
          if ((e as { name?: string })?.name === "AbortError") return;
          setPredictions([]);
        } finally {
          if (!ac.signal.aborted) setIsPredictionsLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, apiKey]);

  const dismissSuggestions = useCallback(() => {
    clearPredictions();
    Keyboard.dismiss();
  }, [clearPredictions]);

  const selectPrediction = useCallback(
    async (prediction: PlacePrediction) => {
      if (!apiKey) return;
      Keyboard.dismiss();
      clearPredictions();
      detailsAbortRef.current?.abort();
      const ac = new AbortController();
      detailsAbortRef.current = ac;
      try {
        const geo = await fetchPlaceDetailsLatLng({
          placeId: prediction.placeId,
          apiKey,
          sessionToken: sessionTokenRef.current,
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        if (!geo) {
          showError("Couldn't load place", "Please try another location.");
          return;
        }
        profileGeocodeSucceededRef.current = true;
        setQueryCenter({ latitude: geo.lat, longitude: geo.lng });
        setSearchInput(prediction.mainText || prediction.description);
        bumpSession();
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === "AbortError") return;
        showError("Couldn't load place", "Please try another location.");
      }
    },
    [apiKey, bumpSession, clearPredictions]
  );

  const goToMyLocation = useCallback(async () => {
    dismissSuggestions();
    const coords = await resolveDeviceLocation(false);
    if (!coords) return;
    profileGeocodeSucceededRef.current = true;
    fallbackCenterAppliedRef.current = true;
    setQueryCenter(coords);
    bumpSession();
    setSearchInput("");
  }, [bumpSession, dismissSuggestions]);

  useEffect(() => {
    return () => {
      predictionsAbortRef.current?.abort();
      detailsAbortRef.current?.abort();
      initialCenterAbortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
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
    placesSearchEnabled: Boolean(apiKey),
    isResolvingInitialCenter,
    suggestionsOpen:
      predictions.length > 0 || isPredictionsLoading || Boolean(placesClientError),
  };
}
