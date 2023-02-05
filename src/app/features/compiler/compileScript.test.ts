import type { ZodType } from "zod";
import { z } from "zod";
import type { CompileScriptResult } from "./compileScript";
import { compileScript } from "./compileScript";
import type { RuntimeScriptAPI } from "./types";

describe("can compile", () => {
  const cases = [
    ["number", "123", z.number(), 123],
    ["string", "'abc'", z.string(), "abc"],
    ["boolean", "true", z.boolean(), true],
    ["null", "null", z.null(), null],
    ["undefined", "undefined", z.undefined(), undefined],
    [
      "class",
      `class Foo {
        constructor (count) {
          this.count = count;
        }
        next () { return ++this.count; } 
      }`,
      z.function(),
      (Foo: new (n: number) => { next(): number }) => {
        expect(Foo.name).toEqual("Foo");
        const foo = new Foo(1);
        foo.next();
        expect(foo.next()).toEqual(3);
      },
    ],
    ["empty array", "[]", z.array(z.any()), []],
    [
      "array with values",
      "[1, `foo`, () => 1]",
      z.tuple([z.number(), z.string(), z.function()]),
      [1, "foo", expect.any(Function)],
    ],
    ["empty object", "{ }", z.object({}), {}],
    [
      "object with properties",
      "{ a: `foo`, b: 2, c () {} }",
      z.object({ a: z.string(), b: z.number(), c: z.function() }),
      { a: "foo", b: 2, c: expect.any(Function) },
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
  expectation: ((value: z.infer<T>) => unknown) | unknown
) {
  function assert(res: CompileScriptResult<T>) {
    if (typeof expectation === "function") {
      if (res.type === "error") {
        throw res.error;
      }
      expectation(res.value as z.infer<T>);
    } else {
      expect(res).toEqual({ type: "success", value: expectation });
    }
  }
  it("using define", () => {
    const res = compileScript(`define(${code})`, { type, scriptAPI });
    assert(res);
  });

  it("using derive", () => {
    const res = compileScript(`derive(() => (${code}))`, { type, scriptAPI });
    assert(res);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scriptAPI: RuntimeScriptAPI<any> = {
  actions: {},
  cloneCard: () => ({} as never),
  random: Math.random,
};
