import { z } from "zod";
import type {
  CompileModuleResult,
  inferModuleOutput,
  ModuleOutputType,
} from "./compileModule";
import { compileModule } from "./compileModule";
import type { RuntimeModuleAPI } from "./types";

describe("can compile", () => {
  describe("single function", () => {
    generateTests("(a, b) => a + b", z.function(), (fn) => {
      expect(fn(1, 2)).toEqual(3);
    });
  });

  describe("function record", () => {
    generateTests(
      `{add: (a, b) => a + b, sub: (a, b) => a - b}`,
      z.object({ add: z.function(), sub: z.function() }),
      ({ add, sub }) => {
        expect(add(1, 2)).toEqual(3);
        expect(sub(1, 2)).toEqual(-1);
      }
    );
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

function generateTests<T extends ModuleOutputType>(
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
