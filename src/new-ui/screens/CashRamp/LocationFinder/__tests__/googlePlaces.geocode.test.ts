/**
 * @jest-environment node
 */
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("react-native-config", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("react-native-device-info", () => ({
  __esModule: true,
  default: {
    getBundleId: () => "com.app.payairo",
  },
}));

import { geocodeAddressToLatLng } from "../googlePlaces";

describe("geocodeAddressToLatLng", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch as typeof fetch;
  });

  it("returns lat/lng from first geocode result", async () => {
    const body = JSON.stringify({
      status: "OK",
      results: [
        {
          geometry: {
            location: { lat: 42.3314, lng: -83.0458 },
          },
        },
      ],
    });

    global.fetch = jest.fn().mockResolvedValue(
      new Response(body, { status: 200, headers: { "Content-Type": "application/json" } })
    ) as unknown as typeof fetch;

    const result = await geocodeAddressToLatLng({
      address: "8023 Jude Overpass, Westshire, MI, 66076, US",
      apiKey: "test-key",
    });

    expect(result).toEqual({ lat: 42.3314, lng: -83.0458 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("maps.googleapis.com/maps/api/geocode/json"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Ios-Bundle-Identifier": "com.app.payairo",
        }),
      })
    );
  });

  it("returns null when geocode status is not OK", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ZERO_RESULTS", results: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    ) as unknown as typeof fetch;

    const result = await geocodeAddressToLatLng({
      address: "nowhere",
      apiKey: "test-key",
    });

    expect(result).toBeNull();
  });
});
