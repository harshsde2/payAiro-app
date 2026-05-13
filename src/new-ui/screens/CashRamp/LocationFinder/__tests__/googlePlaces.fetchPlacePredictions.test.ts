/**
 * @jest-environment node
 */
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("react-native-device-info", () => ({
  __esModule: true,
  default: {
    getBundleId: () => "com.app.payairo",
  },
}));

import { fetchPlacePredictions } from "../googlePlaces";

describe("fetchPlacePredictions", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch as typeof fetch;
  });

  it("calls legacy autocomplete when Places (New) returns ZERO_RESULTS with no rows", async () => {
    const newBody = JSON.stringify({ suggestions: [] });
    const legacyBody = JSON.stringify({
      predictions: [
        {
          place_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          description: "San Francisco, CA, USA",
          structured_formatting: {
            main_text: "San Francisco",
            secondary_text: "CA, USA",
          },
        },
      ],
      status: "OK",
    });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(newBody, { status: 200, headers: { "Content-Type": "application/json" } })
      )
      .mockResolvedValueOnce(
        new Response(legacyBody, { status: 200, headers: { "Content-Type": "application/json" } })
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await fetchPlacePredictions({
      input: "San Fran",
      apiKey: "test-key",
      sessionToken: "a".repeat(32),
      locationBias: { latitude: 37.4, longitude: -122.1 },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.predictions).toHaveLength(1);
    expect(res.predictions[0].placeId).toBe("ChIJIQBpAG2ahYAR_6128GcTUEo");
    expect(res.predictions[0].mainText).toBe("San Francisco");
  });

  it("returns New API rows without calling legacy when New returns predictions", async () => {
    const newBody = JSON.stringify({
      suggestions: [
        {
          placePrediction: {
            place: "places/ChIJIQBpAG2ahYAR_6128GcTUEo",
            text: { text: "San Francisco, CA, USA" },
          },
        },
      ],
    });

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(newBody, { status: 200, headers: { "Content-Type": "application/json" } })
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await fetchPlacePredictions({
      input: "San",
      apiKey: "test-key",
      sessionToken: "b".repeat(32),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.predictions.length).toBeGreaterThanOrEqual(1);
  });
});
