import { z } from "zod";
import type { AnyFunction } from "js-interpreter";
import type {
  CompileModuleResult,
  inferModuleOutput,
  ModuleOutputType,
} from "./compileModule";
import { compileModule } from "./compileModule";
import type { RuntimeModuleAPI } from "./types";

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

  it("a function using a scriptAPI action", () => {
    const res = compileModule(`define(() => actions.add(1, 2))`, {
      type: z.function(),
      scriptAPI: {
        ...scriptAPI,
        actions: { add: (a: number, b: number) => a + b },
      },
    });
    assert(res, (fn) => {
      expect(fn(1, 2)).toEqual(3);
    });
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scriptAPI: RuntimeModuleAPI<any> = {
  actions: {},
  cloneCard: () => ({} as never),
  random: Math.random,
};

function assert<T extends ModuleOutputType>(
  res: CompileModuleResult<T>,
  assertion?: (value: inferModuleOutput<T>) => unknown
) {
  if (res.type === "error") {
    throw res.error;
  }
  assertion?.(res.value as z.infer<T>);
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
    const res = compileModule(`define(${code})`, { type, scriptAPI });
    assert(res, assertion);
  });

  it("using derive", () => {
    const res = compileModule(`derive(() => (${code}))`, { type, scriptAPI });
    assert(res, assertion);
  });
}
