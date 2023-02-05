import type { ZodType } from "zod";
import { z } from "zod";
import type { CompileScriptResult } from "./compileScript";
import { compileScript } from "./compileScript";
import type { RuntimeScriptAPI } from "./types";

describe("can compile", () => {
  describe("number", () => {
    generateTests("123", z.number(), 123);
  });

  describe("string", () => {
    generateTests("'abc'", z.string(), "abc");
  });

  describe("boolean", () => {
    generateTests("true", z.boolean(), true);
  });

  describe("null", () => {
    generateTests("null", z.null(), null);
  });

  describe("undefined", () => {
    generateTests("undefined", z.undefined(), undefined);
  });

  describe("class", () => {
    generateTests(
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
      }
    );
  });

  describe("empty array", () => {
    generateTests("[]", z.array(z.unknown()), []);
  });

  describe("array with values", () => {
    generateTests(
      "[1, `foo`, () => 1]",
      z.tuple([z.number(), z.string(), z.function()]),
      [1, "foo", expect.any(Function)]
    );
  });

  describe("empty object", () => {
    generateTests("{}", z.object({}), {});
  });

  describe("object with properties", () => {
    generateTests(
      "{ a: `foo`, b: 2, c () {} }",
      z.object({ a: z.string(), b: z.number(), c: z.function() }),
      { a: "foo", b: 2, c: expect.any(Function) }
    );
  });

  describe("function", () => {
    generateTests("(a, b) => a + b", z.function(), expect.any(Function));
  });
});

function generateTests<T extends ZodType>(
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
