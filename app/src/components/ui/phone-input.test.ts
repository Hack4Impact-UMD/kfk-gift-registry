import { describe, expect, it } from "vitest";
import { e164ToDisplay, formatPhoneDisplay, formatToE164 } from "./phone-input";

describe("formatPhoneDisplay", () => {
  it("returns an empty string for empty or digitless input", () => {
    expect(formatPhoneDisplay("")).toBe("");
    expect(formatPhoneDisplay("()-")).toBe("");
  });

  it("formats partial input as the user types", () => {
    expect(formatPhoneDisplay("5")).toBe("(5");
    expect(formatPhoneDisplay("555")).toBe("(555");
    expect(formatPhoneDisplay("5551")).toBe("(555)-1");
    expect(formatPhoneDisplay("555123")).toBe("(555)-123");
    expect(formatPhoneDisplay("5551234")).toBe("(555)-123-4");
  });

  it("formats a full 10-digit number", () => {
    expect(formatPhoneDisplay("5551234567")).toBe("(555)-123-4567");
  });

  it("strips a leading US country code from an 11-digit number", () => {
    expect(formatPhoneDisplay("15551234567")).toBe("(555)-123-4567");
    expect(formatPhoneDisplay("+1 (555) 123-4567")).toBe("(555)-123-4567");
  });

  it("ignores non-digit characters", () => {
    expect(formatPhoneDisplay("(555)-123-4567")).toBe("(555)-123-4567");
    expect(formatPhoneDisplay("555.123.4567")).toBe("(555)-123-4567");
  });

  it("truncates input longer than a full number", () => {
    expect(formatPhoneDisplay("55512345678999")).toBe("(555)-123-4567");
  });
});

describe("formatToE164", () => {
  it("prepends +1 to a 10-digit number", () => {
    expect(formatToE164("5551234567")).toBe("+15551234567");
    expect(formatToE164("(555)-123-4567")).toBe("+15551234567");
  });

  it("prepends + to a number that already includes a country code", () => {
    expect(formatToE164("15551234567")).toBe("+15551234567");
  });
});

describe("e164ToDisplay", () => {
  it("returns an empty string for empty input", () => {
    expect(e164ToDisplay("")).toBe("");
  });

  it("formats an E.164 US number with country code", () => {
    expect(e164ToDisplay("+15551234567")).toBe("(555)-123-4567");
  });

  it("formats a 10-digit number without country code", () => {
    expect(e164ToDisplay("5551234567")).toBe("(555)-123-4567");
  });

  it("returns the original value when it is not a US number", () => {
    expect(e164ToDisplay("+447911123456")).toBe("+447911123456");
  });
});
