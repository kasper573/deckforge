/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import type { Result } from "neverthrow";
import type { AnyFunction } from "js-interpreter";
import type {
  AnyModuleOutputType,
  CompiledModule,
  CompiledModules,
  ModuleDefinition,
  ModuleOutputFunction,
  ModuleRuntime,
} from "./types";

export function generateModuleRuntimeTests(createRuntime: () => ModuleRuntime) {
  const t = createRuntimeTestUtils(createRuntime);

  describe("return value", () =>
    t.testModuleOutputs("() => 5", (fn) => {
      expect(fn()).toEqual(5);
    }));

  describe("arguments", () =>
    t.testModuleOutputs("(a, b) => a + b", (fn) => {
      expect(fn(1, 2)).toEqual(3);
    }));

  describe("argument mutation", () =>
    t.testModuleOutputs("(a, b) => { a.x = 1; b.x = 2; }", (fn) => {
      const a = { x: 0 };
      const b = { x: 0 };
      fn(a, b);
      expect(a.x).toEqual(1);
      expect(b.x).toEqual(2);
    }));

  describe("calling empty modules", () => {
    const addFnModule =
      (name: string, code = "") =>
      (runtime: ModuleRuntime) =>
        runtime.addModule(name, { type: z.function(), code });

    const addRecordModule =
      (name: string, code = "") =>
      (runtime: ModuleRuntime) => {
        const functionName = "foo" as const;
        return runtime.addModule(name, {
          type: z.object({ [functionName]: z.function() }),
          code: code ? `define({ ${functionName}: ${code} })` : "",
        })[functionName];
      };

    it("one empty function module", () => testEmptyInvoke(addFnModule("a")));

    it("two empty function modules", () =>
      testEmptyInvoke((runtime) => {
        addFnModule("a")(runtime);
        return addFnModule("b")(runtime);
      }));

    it("two function modules, one empty", () =>
      testEmptyInvoke((runtime) => {
        addFnModule("defined", "define(() => 5)")(runtime);
        return addFnModule("empty")(runtime);
      }));

    it("one empty record module", () => testEmptyInvoke(addRecordModule("a")));

    it("two empty record modules", () =>
      testEmptyInvoke((runtime) => {
        addRecordModule("a")(runtime);
        return addRecordModule("b")(runtime);
      }));

    it("two record modules, one empty", () =>
      testEmptyInvoke((runtime) => {
        addRecordModule("defined", "define(() => 5)")(runtime);
        return addRecordModule("empty")(runtime);
      }));

    it("one record module with one empty and one defined function", () =>
      testEmptyInvoke((runtime) => {
        const record = runtime.addModule("record", {
          type: z.object({ empty: z.function(), defined: z.function() }),
          code: `define({ defined: define(() => 5) })`,
        });
        return record.empty;
      }));

    function testEmptyInvoke(setup: (runtime: ModuleRuntime) => AnyFunction) {
      return t.useRuntimeResult(setup, ([, fn]) => {
        function createArgs() {
          return [{ foo: "bar" }, 2, true];
        }
        const args = createArgs();
        let result: unknown;
        expect(() => (result = fn([...args]))).not.toThrow();
        expect(result).toBeUndefined();
        expect(args).toEqual(createArgs());
      });
    }
  });

  it("calling module A from module B", () =>
    t.useRuntimeResult(
      (runtime) => {
        const moduleA = runtime.addModule("moduleA", {
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        const moduleB = runtime.addModule("moduleB", {
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: { moduleA },
        });
        return moduleB;
      },
      ([, moduleB]) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module A from module B via reference", () =>
    t.useRuntimeResult(
      (runtime) => {
        runtime.addModule("moduleA", {
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        return runtime.addModule("moduleB", {
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: runtime.refs(["moduleA"]),
        });
      },
      ([, moduleB]) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module recursively", () =>
    t.useRuntimeResult(
      (runtime) => {
        const countProxy = (n: number, calls?: number) => count(n, calls);
        const count = runtime.addModule("moduleA", {
          type: z
            .function()
            .args(z.number(), z.number().optional())
            .returns(z.number()),
          code: `define((n, calls = 0) => {
        return n > 0 ? count(n - 1, calls + 1) : calls;
      })`,
          globals: { count: countProxy },
        });
        return count;
      },
      ([, count]) => {
        const res = count(10, undefined);
        expect(res).toEqual(10);
      }
    ));

  it("using arguments mutated by another module during chained function call", () =>
    t.useRuntimeResult(
      (runtime) => {
        const double = runtime.addModule("double", {
          type: z.function(),
          code: `define((state) => state.x *= 2)`,
        });

        return runtime.addModule("program", {
          type: z.function(),
          code: `define((state) => { state.x = 5; double(state); })`,
          globals: { double },
        });
      },
      ([, program]) => {
        const state = { x: 0 };
        program(state);
        expect(state.x).toEqual(10);
      }
    ));

  describe("global functions", () => {
    function test(path: [string, ...string[]]) {
      return t.testCompiledModule(
        {
          type: z.function(),
          code: `define((...args) => ${path.join(".")}(...args))`,
          globals: t.globalAtPath(path, (...args: unknown[]) => [
            path,
            ...args,
          ]),
        },
        (fn) => {
          expect(fn(1, 2)).toEqual([path, 1, 2]);
        }
      );
    }
    it("in root", () => test(["root"]));
    it("in nested object", () => test(["root", "nested"]));
    it("in deeply nested object", () => test(["root", "nested", "deeply"]));
  });

  describe("global values", () => {
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
      t.testCompiledModule(
        {
          type: z.function(),
          globals: t.globalAtPath(path, values),
          code: `define(() => ${path.join(".")})`,
        },
        (fn) => {
          expect(fn()).toEqual(values);
        }
      );
    }
    it("in root", () => test(["root"]));
    it("in nested object", () => test(["root", "nested"]));
    it("in deeply nested object", () => test(["root", "nested", "deeply"]));
  });

  describe("sandboxing", () => {
    generateMaliciousCodeTests();

    describe("via eval", () => {
      generateMaliciousCodeTests((code) => `eval(\`${code}\`)`);
    });

    describe("via Function", () => {
      generateMaliciousCodeTests((code) => `Function(\`return ${code}\`)()`);
    });

    function generateMaliciousCodeTests(wrapCode = (code: string) => code) {
      const symbols = [
        "document",
        "localStorage",
        "fetch",
        "XMLHttpRequest",
        "setTimeout",
        "setInterval",
        "setImmediate",
        "requestAnimationFrame",
        "clearTimeout",
        "clearInterval",
        "clearImmediate",
        "cancelAnimationFrame",
        "alert",
        "confirm",
        "prompt",
        "console",
      ];

      for (const symbolName of symbols) {
        describe(symbolName, () => {
          it("does not exist", () =>
            t.useRuntimeResult(
              (runtime) =>
                runtime.addModule("module", {
                  type: z.function(),
                  code: `define(() => ${wrapCode(symbolName)})`,
                }),
              ([, tryToAccessSymbol]) => {
                expect(tryToAccessSymbol).toThrowError(
                  `${symbolName} is not defined`
                );
              }
            ));

          it("does not exist on window object", () =>
            t.useRuntimeResult(
              (runtime) =>
                runtime.addModule("module", {
                  type: z.function(),
                  code: `define(() => ${wrapCode(
                    `typeof window.${symbolName}`
                  )})`,
                }),
              ([, getSymbolTypeName]) => {
                expect(getSymbolTypeName()).toBe("undefined");
              }
            ));
        });
      }
    }
  });

  it("can compile empty module without errors", () => {
    t.useRuntimeResult((runtime) => {
      runtime.addModule("module", {
        type: z.function(),
        code: ``,
      });
    });
  });
}

export function createRuntimeTestUtils(createRuntime: () => ModuleRuntime) {
  function assert<T, E>(res: Result<T, E>, assertion?: (value: T) => unknown) {
    if (res.isErr()) {
      throw res.error;
    }
    assertion?.(res.value);
  }

  function globalAtPath(path: [string, ...string[]], leafValue: unknown) {
    return path.reduceRight(
      (acc: object, key) => ({ [key]: acc }),
      leafValue as object
    );
  }

  function testModuleOutputs(
    functionDefinitionCode: string,
    assertion: RuntimeAssertion<ZodType<ModuleOutputFunction>>,
    test: typeof testRuntimeResult = testCompiledModule
  ) {
    it("optional single function (assert bypass)", () =>
      test(
        {
          code: `define(${functionDefinitionCode})`,
          type: z.function().optional() as ZodType<AnyFunction>,
        },
        assertion
      ));

    it("single function", () =>
      test(
        {
          code: `define(${functionDefinitionCode})`,
          type: z.function(),
        },
        assertion
      ));

    it("function record", () =>
      test(
        {
          type: z.object({ first: z.function(), second: z.function() }),
          code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
        },
        ({ first, second }, result) => {
          assertion(first, result);
          assertion(second, result);
        }
      ));

    it("partial function record", () =>
      test(
        {
          type: z
            .object({ first: z.function(), second: z.function() })
            .partial(),
          code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
        },
        ({ first, second }, result) => {
          assertion(first!, result);
          assertion(second!, result);
        }
      ));
  }

  function testCompiledModule<Def extends ModuleDefinition>(
    definition: Def,
    assertion: RuntimeAssertion<Def["type"]>
  ) {
    return testRuntimeResult(definition, (module, result) => {
      assert(result, () => assertion(module, result));
    });
  }

  function testRuntimeResult<Def extends ModuleDefinition>(
    definition: Def,
    assertion: RuntimeAssertion<Def["type"]>
  ) {
    return useRuntimeResult(
      (runtime) => runtime.addModule("main", definition),
      ([result, module]) => assertion(module, result)
    );
  }

  function useRuntimeResult<T extends AnyModuleOutputType, SetupOutput>(
    setup: (runtime: ModuleRuntime) => SetupOutput,
    handle?: (res: [Result<CompiledModules, unknown>, SetupOutput]) => void
  ) {
    const runtime = createRuntime();
    try {
      const output = setup(runtime);
      const result = runtime.compile();
      handle?.([result, output]);
    } finally {
      runtime.dispose();
    }
  }

  return {
    assert,
    globalAtPath,
    testModuleOutputs,
    testCompiledModule,
    testRuntimeResult,
    useRuntimeResult,
  };
}

export type RuntimeAssertion<T extends AnyModuleOutputType> = (
  module: CompiledModule<T>,
  result: Result<CompiledModules, unknown>
) => unknown;
