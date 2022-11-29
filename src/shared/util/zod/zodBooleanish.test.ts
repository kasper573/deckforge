import { zodBooleanish } from "./zodBooleanish";

describe("zodBooleanish", () => {
  it("should return true for 'true'", () => {
    expect(zodBooleanish.parse("true")).toBe(true);
  });

  it("should return true for 'TRUE'", () => {
    expect(zodBooleanish.parse("TRUE")).toBe(true);
  });

  it("should return true for 'tRuE'", () => {
    expect(zodBooleanish.parse("tRuE")).toBe(true);
  });

  it("should return true for '1'", () => {
    expect(zodBooleanish.parse("1")).toBe(true);
  });

  it("should return false for 'false'", () => {
    expect(zodBooleanish.parse("false")).toBe(false);
  });

  it("should return false for 'FALSE'", () => {
    expect(zodBooleanish.parse("FALSE")).toBe(false);
  });

  it("should return false for 'fAlSE'", () => {
    expect(zodBooleanish.parse("fAlSE")).toBe(false);
  });

  it("should return false for '0'", () => {
    expect(zodBooleanish.parse("0")).toBe(false);
  });
});
