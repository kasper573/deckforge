import { adjacent } from "./adjacent";

describe("adjacent", () => {
  it("should return undefined if list is empty", () => {
    expect(adjacent([], 0)).toBeUndefined();
  });
  it("should return undefined if list has one item", () => {
    expect(adjacent([0], 0)).toBeUndefined();
  });
  it("should return undefined if item is not in list", () => {
    expect(adjacent([0, 1], 2)).toBeUndefined();
  });
  it("should return next item if item is first", () => {
    expect(adjacent([0, 1], 0)).toBe(1);
  });
  it("should return previous item if item is last", () => {
    expect(adjacent([0, 1], 1)).toBe(0);
  });
  it("should return next item if item is in the middle", () => {
    expect(adjacent([0, 1, 2], 1)).toBe(2);
  });
  it("should return previous item if item is in the middle", () => {
    expect(adjacent([0, 1, 2], 1, -1)).toBe(0);
  });
});
