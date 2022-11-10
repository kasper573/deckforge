import { add } from "./example";

describe("example", () => {
  it("can get hello from tRPC", () => {
    expect(add(1, 2)).toBe(3);
  });
});
