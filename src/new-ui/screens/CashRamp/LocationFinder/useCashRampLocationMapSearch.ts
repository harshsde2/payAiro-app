import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";
import MapView from "react-native-maps";
import Geolocation, { type GeolocationResponse } from "@react-native-community/geolocation";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Config from "react-native-config";
import { showError } from "utils/toast";
import { getInitialCoordinates } from "./locationFinder.utils";
import {
  fetchPlaceDetailsLatLng,
  fetchPlacePredictions,
  newPlacesSessionToken,
  type PlacePrediction,
} from "./googlePlaces";

const DEBOUNCE_MS = 320;

const REGION_DELTA = { latitudeDelta: 0.12, longitudeDelta: 0.08 };

function getPlacesRestApiKey(): string | undefined {
  const raw =
    Platform.OS === "ios"
      ? Config.GOOGLE_MAPS_API_KEY_IOS || Config.GOOGLE_MAPS_API_KEY
      : Config.GOOGLE_MAPS_API_KEY_ANDROID || Config.GOOGLE_MAPS_API_KEY;
  const t = (raw || "").trim();
  return t || undefined;
}

export function useCashRampLocationMapSearch() {
  const fallback = useMemo(() => getInitialCoordinates(), []);
  const [queryCenter, setQueryCenter] = useState(fallback);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);
  const [placesClientError, setPlacesClientError] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const sessionTokenRef = useRef(newPlacesSessionToken());
  const predictionsAbortRef = useRef<AbortController | null>(null);
  const detailsAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstPanRef = useRef(true);

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
          showError("Could not load that place.");
          return;
        }
        setQueryCenter({ latitude: geo.lat, longitude: geo.lng });
        setSearchInput(prediction.mainText || prediction.description);
        bumpSession();
      } catch (e: unknown) {
        if ((e as { name?: string })?.name === "AbortError") return;
        showError("Could not load that place.");
      }
    },
    [apiKey, bumpSession, clearPredictions]
  );

  const goToMyLocation = useCallback(async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const result = await request(permission);
    if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
      showError("Location permission is required to use current location.");
      return;
    }
    dismissSuggestions();
    try {
      const pos = await new Promise<GeolocationResponse>((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 18000,
          maximumAge: 10000,
        });
      });
      const { latitude, longitude } = pos.coords;
      setQueryCenter({ latitude, longitude });
      bumpSession();
      setSearchInput("");
    } catch {
      showError("Unable to read your current location.");
    }
  }, [bumpSession, dismissSuggestions]);

  useEffect(() => {
    return () => {
      predictionsAbortRef.current?.abort();
      detailsAbortRef.current?.abort();
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
    suggestionsOpen:
      predictions.length > 0 || isPredictionsLoading || Boolean(placesClientError),
  };
}
