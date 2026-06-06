/**
 * @jest-environment node
 */
jest.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

jest.mock("react-native-config", () => ({
  __esModule: true,
  default: {
    GOOGLE_MAPS_ANDROID_CERT_SHA1: "5e8f16062ea3cd2c4a0d547876baa6f38cabf625",
  },
}));

jest.mock("react-native-device-info", () => ({
  __esModule: true,
  default: {
    getBundleId: () => "com.payairo.staging",
  },
}));

import { fetchPlacePredictions } from "../googlePlaces";

describe("fetchPlacePredictions Android headers", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch as typeof fetch;
  });

  it("sends X-Android-Package and X-Android-Cert on Places (New) requests", async () => {
    const newBody = JSON.stringify({
      suggestions: [
        {
          placePrediction: {
            placeId: "ChIJtest",
            text: { text: "Test Place" },
          },
        },
      ],
    });

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(newBody, { status: 200, headers: { "Content-Type": "application/json" } })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchPlacePredictions({
      input: "test",
      apiKey: "test-key",
      sessionToken: "c".repeat(32),
    });

    expect(fetchMock).toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Android-Package"]).toBe("com.payairo.staging");
    expect(headers["X-Android-Cert"]).toBe("5e8f16062ea3cd2c4a0d547876baa6f38cabf625");
  });
});
