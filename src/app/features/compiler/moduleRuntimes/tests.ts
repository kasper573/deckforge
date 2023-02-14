/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import type { AnyFunction } from "js-interpreter";
import type {
  ModuleDefinition,
  ModuleOutputFunction,
  ModuleCompiler,
} from "./types";
import type { RuntimeCompileResult } from "./types";

export function generateModuleRuntimeTests(
  createCompiler: () => ModuleCompiler
) {
  const t = createRuntimeTestUtils(createCompiler);

  describe("empty definitions", () => {
    it("can define a function module without error", () =>
      t.assertValidRuntime((compiler) => {
        compiler.addModule({
          name: "test",
          type: z.function(),
          code: "define(() => {})",
        });
      }));

    it("can define a record module without error", () =>
      t.assertValidRuntime((compiler) => {
        compiler.addModule({
          name: "test",
          type: z.object({ foo: z.function() }),
          code: "define({ foo () { } })",
        });
      }));

    it("can compile empty module without errors", () => {
      t.assertValidRuntime((compiler) => {
        compiler.addModule({ name: "module", type: z.function(), code: `` });
      });
    });
  });

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
      (compiler: ModuleCompiler) =>
        compiler.addModule({ name, type: z.function(), code });

    const addRecordModule =
      (name: string, code = "") =>
      (compiler: ModuleCompiler) => {
        const functionName = "foo" as const;
        return compiler.addModule({
          name,
          type: z.object({ [functionName]: z.function() }),
          code: code ? `define({ ${functionName}: ${code} })` : "",
        })[functionName];
      };

    it("one empty function module", () => testEmptyInvoke(addFnModule("a")));

    it("two empty function modules", () =>
      testEmptyInvoke((compiler) => {
        addFnModule("a")(compiler);
        return addFnModule("b")(compiler);
      }));

    it("two function modules, one empty", () =>
      testEmptyInvoke((compiler) => {
        addFnModule("defined", "define(() => 5)")(compiler);
        return addFnModule("empty")(compiler);
      }));

    it("one empty record module", () => testEmptyInvoke(addRecordModule("a")));

    it("two empty record modules", () =>
      testEmptyInvoke((compiler) => {
        addRecordModule("a")(compiler);
        return addRecordModule("b")(compiler);
      }));

    it("two record modules, one empty", () =>
      testEmptyInvoke((compiler) => {
        addRecordModule("defined", "define(() => 5)")(compiler);
        return addRecordModule("empty")(compiler);
      }));

    it("one record module with one empty and one defined function", () =>
      testEmptyInvoke((compiler) => {
        const record = compiler.addModule({
          name: "record",
          type: z.object({ empty: z.function(), defined: z.function() }),
          code: `define({ defined: define(() => 5) })`,
        });
        return record.empty;
      }));

    function testEmptyInvoke(setup: (runtime: ModuleCompiler) => AnyFunction) {
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

  describe("module relationships", () => {
    it("calling module A from module B", () =>
      t.assertValidRuntime(
        (compiler) => {
          const moduleA = compiler.addModule({
            name: "moduleA",
            type: z.function(),
            code: `define((...args) => ["A", ...args])`,
          });
          const moduleB = compiler.addModule({
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
        (compiler) => {
          compiler.addModule({
            name: "moduleA",
            type: z.function(),
            code: `define((...args) => ["A", ...args])`,
          });
          return compiler.addModule({
            name: "moduleB",
            type: z.function(),
            code: `define((...args) => moduleA("B", ...args))`,
            globals: compiler.refs(["moduleA"]),
          });
        },
        (moduleB) => {
          const res = moduleB("input");
          expect(res).toEqual(["A", "B", "input"]);
        }
      ));

    it.skip("calling module A from module B via future reference", () =>
      t.assertValidRuntime(
        (compiler) => {
          const b = compiler.addModule({
            name: "moduleB",
            type: z.function(),
            code: `define((...args) => moduleA("B", ...args))`,
            globals: compiler.refs(["moduleA"]),
          });
          compiler.addModule({
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
        (compiler) => {
          const countProxy = (n: number, calls?: number) => count(n, calls);
          const count = compiler.addModule({
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
        (compiler) => {
          const double = compiler.addModule({
            name: "double",
            type: z.function(),
            code: `define((state) => state.x *= 2)`,
          });

          return compiler.addModule({
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
  });

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
              (compiler) =>
                compiler.addModule({
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
              (compiler) =>
                compiler.addModule({
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
}

export function createRuntimeTestUtils<Compiler extends ModuleCompiler>(
  createCompiler: () => Compiler
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
      (compiler) => compiler.addModule({ name: "main", ...definition }),
      assert
    );
  }

  function assertValidRuntime<T>(
    setup: (compiler: Compiler) => T,
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
    setup: (compiler: Compiler) => T,
    handle?: (result: RuntimeCompileResult, setupOutput: T) => void
  ) {
    const compiler = createCompiler();

    let setupOutput: T;
    let setupError: unknown;
    try {
      setupOutput = setup(compiler);
    } catch (error) {
      setupError = error;
    }

    const result = compiler.compile();

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
      compiler.dispose();
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
