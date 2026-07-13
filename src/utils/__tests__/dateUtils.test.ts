import { parseServerDate, formatServerDate } from "../dateUtils";

describe("parseServerDate", () => {
  it("treats a naive (offset-less) string as UTC", () => {
    // The whole point: a naive server string must be read as UTC, not local.
    expect(parseServerDate("2026-07-08T18:30:00").valueOf()).toBe(
      Date.UTC(2026, 6, 8, 18, 30, 0)
    );
  });

  it("produces the same instant for a naive string and its explicit Z form", () => {
    expect(parseServerDate("2026-07-08T18:30:00").valueOf()).toBe(
      parseServerDate("2026-07-08T18:30:00Z").valueOf()
    );
  });

  it("respects an explicit timezone offset", () => {
    // 18:30 at +05:30 is 13:00 UTC.
    expect(parseServerDate("2026-07-08T18:30:00+05:30").valueOf()).toBe(
      Date.UTC(2026, 6, 8, 13, 0, 0)
    );
  });

  it("accepts a space-separated naive datetime as UTC", () => {
    expect(parseServerDate("2026-07-08 18:30:00").valueOf()).toBe(
      Date.UTC(2026, 6, 8, 18, 30, 0)
    );
  });

  it("passes through epoch milliseconds as an absolute instant", () => {
    const epoch = Date.UTC(2026, 6, 8, 18, 30, 0);
    expect(parseServerDate(epoch).valueOf()).toBe(epoch);
  });

  it("returns an invalid moment for empty / null / garbage input", () => {
    expect(parseServerDate(null).isValid()).toBe(false);
    expect(parseServerDate(undefined).isValid()).toBe(false);
    expect(parseServerDate("").isValid()).toBe(false);
    expect(parseServerDate("not-a-date").isValid()).toBe(false);
  });
});

describe("formatServerDate", () => {
  it("returns the fallback for unparseable input", () => {
    expect(formatServerDate(null, "DD MMM YYYY", "—")).toBe("—");
    expect(formatServerDate("nope", "DD MMM YYYY")).toBe("");
  });

  it("formats a valid timestamp", () => {
    // Date-only format is timezone-stable for a UTC-midday input across US zones.
    expect(formatServerDate("2026-07-08T12:00:00Z", "YYYY-MM-DD")).toBe(
      "2026-07-08"
    );
  });
});
