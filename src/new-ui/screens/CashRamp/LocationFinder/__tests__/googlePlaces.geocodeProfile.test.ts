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

import { geocodeProfileLegalIdentity } from "../googlePlaces";

describe("geocodeProfileLegalIdentity", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch as typeof fetch;
  });

  it("falls back to MI state center when all geocode requests fail", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: "ZERO_RESULTS", results: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    ) as unknown as typeof fetch;

    const result = await geocodeProfileLegalIdentity({
      profile: {
        addressLine: "8023 Jude Overpass, Westshire, MI, 66076, US",
        city: "Westshire",
        stateCode: "MI",
        postalCode: "66076",
      },
      apiKey: "test-key",
    });

    expect(result).toEqual({ lat: 43.3261, lng: -84.5361 });
  });
});
