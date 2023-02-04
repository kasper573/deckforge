import type { ZodType } from "zod";
import { z } from "zod";
import { compileScript } from "./compileScript";
import type { RuntimeScriptAPI } from "./types";

describe("can compile", () => {
  const cases = [
    ["number", "123", z.number(), 123],
    ["string", "'abc'", z.string(), "abc"],
    ["boolean", "true", z.boolean(), true],
    [
      "array",
      "[1, `foo`, 3]",
      z.tuple([z.number(), z.string(), z.number()]),
      [1, "foo", 3],
    ],
    [
      "object",
      "{ a: `foo`, b: 2 }",
      z.object({ a: z.string(), b: z.number() }),
      { a: "foo", b: 2 },
    ],
    ["function", "(a, b) => a + b", z.function(), expect.any(Function)],
  ] as const;

  for (const [name, code, type, expectation] of cases) {
    describe(name, () => {
      generateCompileScriptTest(code, type, expectation);
    });
  }
});

function generateCompileScriptTest<T extends ZodType>(
  code: string,
  type: T,
  expectation: unknown
) {
  it("using define", () => {
    const res = compileScript(`define(${code})`, { type, scriptAPI });
    expect(res).toEqual({ type: "success", value: expectation });
  });

  it.skip("using derive", () => {
    const res = compileScript(`derive(() => (${code}))`, { type, scriptAPI });
    expect(res).toEqual({ type: "success", value: expectation });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scriptAPI: RuntimeScriptAPI<any> = {
  actions: {},
  cloneCard: () => ({} as never),
  random: Math.random,
};
