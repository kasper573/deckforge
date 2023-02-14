/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import type { AnyFunction } from "js-interpreter";
import type {
  ModuleDefinition,
  ModuleOutputFunction,
  ModuleRuntime,
} from "./types";
import type { ModuleRuntimeCompileResult } from "./types";

export function generateModuleRuntimeTests(createRuntime: () => ModuleRuntime) {
  const t = createRuntimeTestUtils(createRuntime);

  it("can define a function module without error", () =>
    t.assertValidRuntime((runtime) => {
      runtime.addModule({
        name: "test",
        type: z.function(),
        code: "define(() => {})",
      });
    }));

  it("can define a record module without error", () =>
    t.assertValidRuntime((runtime) => {
      runtime.addModule({
        name: "test",
        type: z.object({ foo: z.function() }),
        code: "define({ foo () { } })",
      });
    }));

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
        runtime.addModule({ name, type: z.function(), code });

    const addRecordModule =
      (name: string, code = "") =>
      (runtime: ModuleRuntime) => {
        const functionName = "foo" as const;
        return runtime.addModule({
          name,
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
        const record = runtime.addModule({
          name: "record",
          type: z.object({ empty: z.function(), defined: z.function() }),
          code: `define({ defined: define(() => 5) })`,
        });
        return record.empty;
      }));

    function testEmptyInvoke(setup: (runtime: ModuleRuntime) => AnyFunction) {
      return t.assertValidRuntime(setup, (fn) => {
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
    t.assertValidRuntime(
      (runtime) => {
        const moduleA = runtime.addModule({
          name: "moduleA",
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        const moduleB = runtime.addModule({
          name: "moduleB",
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: { moduleA },
        });
        return moduleB;
      },
      (moduleB) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module A from module B via reference", () =>
    t.assertValidRuntime(
      (runtime) => {
        runtime.addModule({
          name: "moduleA",
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        return runtime.addModule({
          name: "moduleB",
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: runtime.refs(["moduleA"]),
        });
      },
      (moduleB) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module A from module B via future reference", () =>
    t.assertValidRuntime(
      (runtime) => {
        const b = runtime.addModule({
          name: "moduleB",
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: runtime.refs(["moduleA"]),
        });
        runtime.addModule({
          name: "moduleA",
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        return b;
      },
      (moduleB) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module recursively", () =>
    t.assertValidRuntime(
      (runtime) => {
        const countProxy = (n: number, calls?: number) => count(n, calls);
        const count = runtime.addModule({
          name: "moduleA",
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
      (count) => {
        const res = count(10, undefined);
        expect(res).toEqual(10);
      }
    ));

  it("using arguments mutated by another module during chained function call", () =>
    t.assertValidRuntime(
      (runtime) => {
        const double = runtime.addModule({
          name: "double",
          type: z.function(),
          code: `define((state) => state.x *= 2)`,
        });

        return runtime.addModule({
          name: "program",
          type: z.function(),
          code: `define((state) => { state.x = 5; double(state); })`,
          globals: { double },
        });
      },
      (program) => {
        const state = { x: 0 };
        program(state);
        expect(state.x).toEqual(10);
      }
    ));

  describe("global functions", () => {
    function test(path: [string, ...string[]]) {
      return t.testModuleOutput(
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
        //undefined,
      ];
      for (const value of values) {
        it(JSON.stringify(value), () => {
          t.testModuleOutput(
            {
              type: z.function(),
              globals: t.globalAtPath(path, value),
              code: `define(() => ${path.join(".")})`,
            },
            (fn) => {
              expect(fn()).toEqual(value);
            }
          );
        });

        it(`${JSON.stringify(value)} in array`, () => {
          t.testModuleOutput(
            {
              type: z.function(),
              globals: t.globalAtPath(path, [value]),
              code: `define(() => ${path.join(".")})`,
            },
            (fn) => {
              expect(fn()).toEqual([value]);
            }
          );
        });
      }
    }
    describe("in root", () => test(["root"]));
    describe("in nested object", () => test(["root", "nested"]));
    describe("in deeply nested object", () =>
      test(["root", "nested", "deeply"]));
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
            t.assertValidRuntime(
              (runtime) =>
                runtime.addModule({
                  name: "module",
                  type: z.function(),
                  code: `define(() => ${wrapCode(symbolName)})`,
                }),
              (tryToAccessSymbol) => {
                expect(tryToAccessSymbol).toThrowError(
                  new RegExp(`${symbolName}['"]? is not defined`)
                );
              }
            ));

          it("does not exist on window object", () =>
            t.assertValidRuntime(
              (runtime) =>
                runtime.addModule({
                  name: "module",
                  type: z.function(),
                  code: `define(() => ${wrapCode(
                    `typeof window !== "undefined" ? typeof window.${symbolName} : "undefined"`
                  )})`,
                }),
              (getSymbolTypeName) => {
                expect(getSymbolTypeName()).toBe("undefined");
              }
            ));
        });
      }
    }
  });

  it("can compile empty module without errors", () => {
    t.assertValidRuntime((runtime) => {
      runtime.addModule({ name: "module", type: z.function(), code: `` });
    });
  });
}

export function createRuntimeTestUtils<Runtime extends ModuleRuntime>(
  createRuntime: () => Runtime
) {
  function globalAtPath(path: [string, ...string[]], leafValue: unknown) {
    return path.reduceRight(
      (acc: object, key) => ({ [key]: acc }),
      leafValue as object
    );
  }

  function testModuleOutputs(
    functionDefinitionCode: string,
    assert: (output: ModuleOutputFunction) => void
  ) {
    it("optional single function (assert bypass)", () =>
      testModuleOutput(
        {
          code: `define(${functionDefinitionCode})`,
          type: z.function().optional() as ZodType<AnyFunction>,
        },
        assert
      ));

    it("single function", () =>
      testModuleOutput(
        {
          code: `define(${functionDefinitionCode})`,
          type: z.function(),
        },
        assert
      ));

    it("function record", () =>
      testModuleOutput(
        {
          type: z.object({ first: z.function(), second: z.function() }),
          code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
        },
        ({ first, second }) => {
          assert(first);
          assert(second);
        }
      ));

    it("partial function record", () =>
      testModuleOutput(
        {
          type: z
            .object({ first: z.function(), second: z.function() })
            .partial(),
          code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
        },
        ({ first, second }) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          assert(first!);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          assert(second!);
        }
      ));
  }

  function testModuleOutput<Def extends Omit<ModuleDefinition, "name">>(
    definition: Def,
    assert: (output: z.infer<Def["type"]>) => void
  ) {
    return assertValidRuntime(
      (runtime) => runtime.addModule({ name: "main", ...definition }),
      assert
    );
  }

  function assertValidRuntime<T>(
    setup: (runtime: Runtime) => T,
    assert?: (setupOutput: T) => void
  ) {
    return useRuntime(setup, (result, setupOutput) => {
      if (result.isErr()) {
        throw result.error;
      }
      assert?.(setupOutput);
    });
  }

  function useRuntime<T>(
    setup: (runtime: Runtime) => T,
    handle?: (result: ModuleRuntimeCompileResult, setupOutput: T) => void
  ) {
    const runtime = createRuntime();

    let setupOutput: T;
    let setupError: unknown;
    try {
      setupOutput = setup(runtime);
    } catch (error) {
      setupError = error;
    }

    const result = runtime.compile();

    let handlerError: unknown;
    if (!setupError) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        handle?.(result, setupOutput!);
      } catch (error) {
        handlerError = error;
      }
    }

    let disposeError: unknown;
    try {
      runtime.dispose();
    } catch (error) {
      disposeError = error;
    }

    if (setupError) {
      throw setupError;
    }
    if (handlerError) {
      throw handlerError;
    }
    if (disposeError) {
      throw disposeError;
    }
  }

  return {
    globalAtPath,
    testModuleOutputs,
    testModuleOutput,
    assertValidRuntime,
    useRuntime,
  };
}
