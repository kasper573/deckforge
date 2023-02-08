import { z } from "zod";
import type { AnyFunction } from "js-interpreter";
import type {
  CompileModuleResult,
  inferModuleOutput,
  ModuleOutputType,
} from "./compileModule";
import { compileModule } from "./compileModule";

describe("supports", () => {
  describe("function return value", () => {
    generateTests("(a, b) => a + b", (fn) => {
      expect(fn(1, 2)).toEqual(3);
    });
  });

  describe("function argument mutation", () => {
    generateTests("(a, b) => { a.x = 1; b.x = 2; }", (fn) => {
      const a = { x: 0 };
      const b = { x: 0 };
      fn(a, b);
      expect(a.x).toEqual(1);
      expect(b.x).toEqual(2);
    });
  });

  describe("function calling scriptAPI functions", () => {
    function test(path: [string, ...string[]]) {
      const res = compileWithScriptAPIValueAtPath(
        path,
        `define((...args) => ${path.join(".")}(...args))`,
        (...args: unknown[]) => [path, ...args]
      );
      assert(res, (fn) => {
        expect(fn(1, 2)).toEqual([path, 1, 2]);
      });
    }
    it("in root", () => test(["root"]));
    it("in nested object", () => test(["root", "nested"]));
    it("in deeply nested object", () => test(["root", "nested", "deeply"]));
  });

  describe("function using scriptAPI values", () => {
    function test(path: [string, ...string[]]) {
      const values = [
        false,
        true,
        0,
        1,
        "",
        "a",
        {},
        { a: 1 },
        [],
        [1, 2, 3],
        null,
        undefined,
      ];
      const res = compileWithScriptAPIValueAtPath(
        path,
        `define(() => ${path.join(".")})`,
        values
      );
      assert(res, (fn) => {
        expect(fn()).toEqual(values);
      });
    }
    it("in root", () => test(["root"]));
    it("in nested object", () => test(["root", "nested"]));
    it("in deeply nested object", () => test(["root", "nested", "deeply"]));
  });
});

function assert<T extends ModuleOutputType>(
  res: CompileModuleResult<T>,
  assertion?: (value: inferModuleOutput<T>) => unknown
) {
  if (res.type === "error") {
    throw res.error;
  }
  assertion?.(res.value as z.infer<T>);
}

function compileWithScriptAPIValueAtPath(
  path: [string, ...string[]],
  code: string,
  leafValue: unknown
) {
  const scriptAPI = path.reduceRight(
    (acc: object, key) => ({ [key]: acc }),
    leafValue as object
  );

  return compileModule(code, {
    type: z.function(),
    scriptAPI,
  });
}

function generateTests(
  functionDefinitionCode: string,
  assertion: (value: AnyFunction) => unknown
) {
  describe("single function", () => {
    generateDefineDeriveTestBranches(
      functionDefinitionCode,
      z.function(),
      assertion
    );
  });

  describe("function record", () => {
    generateDefineDeriveTestBranches(
      `{ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} }`,
      z.object({ first: z.function(), second: z.function() }),
      ({ first, second }) => {
        assertion(first);
        assertion(second);
      }
    );
  });
}

function generateDefineDeriveTestBranches<T extends ModuleOutputType>(
  code: string,
  type: T,
  assertion: (value: inferModuleOutput<T>) => unknown
) {
  it("using define", () => {
    const res = compileModule(`define(${code})`, { type });
    assert(res, assertion);
  });

  it("using derive", () => {
    const res = compileModule(`derive(() => (${code}))`, { type });
    assert(res, assertion);
  });
}
