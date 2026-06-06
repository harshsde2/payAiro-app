import {
  buildLegalIdentityAddressLine,
  buildProfileGeocodeAttempts,
  getUsStateCenterCoordinates,
  parseLegalIdentityForGeocode,
} from "../locationFinder.utils";

describe("buildLegalIdentityAddressLine", () => {
  it("returns null when usersMe or legal_identity is missing", () => {
    expect(buildLegalIdentityAddressLine(null)).toBeNull();
    expect(buildLegalIdentityAddressLine({})).toBeNull();
    expect(buildLegalIdentityAddressLine({ legal_identity: null })).toBeNull();
  });

  it("returns null when address_line1 and city are both missing", () => {
    expect(
      buildLegalIdentityAddressLine({
        legal_identity: { state: "MI", postal_code: "66076" },
      })
    ).toBeNull();
  });

  it("formats full legal_identity address for geocoding", () => {
    expect(
      buildLegalIdentityAddressLine({
        legal_identity: {
          address_line1: "8023 Jude Overpass",
          address_line2: "",
          city: "Westshire",
          state: "MI",
          postal_code: "66076",
          country_alpha3: "USA",
        },
      })
    ).toBe("8023 Jude Overpass, Westshire, MI, 66076, US");
  });

  it("reads legal_identity from nested users/me data envelope", () => {
    expect(
      parseLegalIdentityForGeocode({
        data: {
          legal_identity: {
            address_line1: "100 Main St",
            city: "Detroit",
            state: "MI",
          },
        },
      })
    ).toEqual({
      addressLine: "100 Main St, Detroit, MI",
      city: "Detroit",
      stateCode: "MI",
      postalCode: null,
    });
  });

  it("parseLegalIdentityForGeocode exposes state and postal for geocoder bias", () => {
    expect(
      parseLegalIdentityForGeocode({
        legal_identity: {
          address_line1: "8023 Jude Overpass",
          city: "Westshire",
          state: "MI",
          postal_code: "66076",
          country_alpha3: "USA",
        },
      })
    ).toEqual({
      addressLine: "8023 Jude Overpass, Westshire, MI, 66076, US",
      city: "Westshire",
      stateCode: "MI",
      postalCode: "66076",
    });
  });

  it("buildProfileGeocodeAttempts omits postal from components (zip/state conflicts)", () => {
    const input = parseLegalIdentityForGeocode({
      legal_identity: {
        address_line1: "8023 Jude Overpass",
        city: "Westshire",
        state: "MI",
        postal_code: "66076",
      },
    });
    expect(input).not.toBeNull();
    const attempts = buildProfileGeocodeAttempts(input!);
    expect(attempts.length).toBeGreaterThanOrEqual(2);
    expect(attempts.every((a) => a.includePostalInComponents === false)).toBe(true);
  });

  it("getUsStateCenterCoordinates returns MI center", () => {
    const mi = getUsStateCenterCoordinates("MI");
    expect(mi?.latitude).toBeCloseTo(43.33, 1);
    expect(mi?.longitude).toBeCloseTo(-84.54, 1);
  });

  it("includes address_line2 when present", () => {
    expect(
      buildLegalIdentityAddressLine({
        legal_identity: {
          address_line1: "100 Main St",
          address_line2: "Apt 4",
          city: "Detroit",
          state: "MI",
        },
      })
    ).toBe("100 Main St, Apt 4, Detroit, MI");
  });
});
