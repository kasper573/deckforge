/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import type { Result } from "neverthrow";
import type { AnyFunction } from "js-interpreter";
import type { QuickJSWASMModule } from "quickjs-emscripten";
import { getQuickJS } from "quickjs-emscripten";
import type {
  AnyModuleOutputType,
  CompiledModule,
  CompiledModules,
  ModuleDefinition,
  ModuleOutputFunction,
} from "./compileModule";
import { ModuleCompiler } from "./compileModule";

let quickJS: QuickJSWASMModule;
describe("supports", () => {
  beforeAll(async () => {
    quickJS = await getQuickJS();
  });

  describe("return value", () =>
    testModuleOutputs("() => 5", (fn) => {
      expect(fn()).toEqual(5);
    }));

  describe("arguments", () =>
    testModuleOutputs("(a, b) => a + b", (fn) => {
      expect(fn(1, 2)).toEqual(3);
    }));

  describe("argument mutation", () =>
    testModuleOutputs("(a, b) => { a.x = 1; b.x = 2; }", (fn) => {
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
        compiler.addModule(name, { type: z.function(), code });

    const addRecordModule =
      (name: string, code = "") =>
      (compiler: ModuleCompiler) => {
        const functionName = "foo" as const;
        return compiler.addModule(name, {
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
        const record = compiler.addModule("record", {
          type: z.object({ empty: z.function(), defined: z.function() }),
          code: `define({ defined: define(() => 5) })`,
        });
        return record.empty;
      }));

    function testEmptyInvoke(setup: (compiler: ModuleCompiler) => AnyFunction) {
      return useCompilerResult(setup, ([, fn]) => {
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
    useCompilerResult(
      (compiler) => {
        const moduleA = compiler.addModule("moduleA", {
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        const moduleB = compiler.addModule("moduleB", {
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
    useCompilerResult(
      (compiler) => {
        compiler.addModule("moduleA", {
          type: z.function(),
          code: `define((...args) => ["A", ...args])`,
        });
        return compiler.addModule("moduleB", {
          type: z.function(),
          code: `define((...args) => moduleA("B", ...args))`,
          globals: compiler.refs(["moduleA"]),
        });
      },
      ([, moduleB]) => {
        const res = moduleB("input");
        expect(res).toEqual(["A", "B", "input"]);
      }
    ));

  it("calling module recursively", () =>
    useCompilerResult(
      (compiler) => {
        const countProxy = (n: number, calls?: number) => count(n, calls);
        const count = compiler.addModule("moduleA", {
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
    useCompilerResult(
      (compiler) => {
        const double = compiler.addModule("double", {
          type: z.function(),
          code: `define((state) => state.x *= 2)`,
        });

        return compiler.addModule("program", {
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
      return testCompiledModule(
        {
          type: z.function(),
          code: `define((...args) => ${path.join(".")}(...args))`,
          globals: globalAtPath(path, (...args: unknown[]) => [path, ...args]),
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
      testCompiledModule(
        {
          type: z.function(),
          globals: globalAtPath(path, values),
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
            useCompilerResult(
              (compiler) =>
                compiler.addModule("module", {
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
            useCompilerResult(
              (compiler) =>
                compiler.addModule("module", {
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
    useCompilerResult((compiler) => {
      compiler.addModule("module", {
        type: z.function(),
        code: ``,
      });
    });
  });
});

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
  assertion: CompilerAssertion<ZodType<ModuleOutputFunction>>,
  test: typeof testCompilerResult = testCompiledModule
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
        type: z.object({ first: z.function(), second: z.function() }).partial(),
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
  assertion: CompilerAssertion<Def["type"]>
) {
  return testCompilerResult(definition, (module, result) => {
    assert(result, () => assertion(module, result));
  });
}

type CompilerAssertion<T extends AnyModuleOutputType> = (
  module: CompiledModule<T>,
  result: Result<CompiledModules, unknown>
) => unknown;

function testCompilerResult<Def extends ModuleDefinition>(
  definition: Def,
  assertion: CompilerAssertion<Def["type"]>
) {
  return useCompilerResult(
    (compiler) => compiler.addModule("main", definition),
    ([result, module]) => assertion(module, result)
  );
}

function useCompilerResult<T extends AnyModuleOutputType, SetupOutput>(
  setup: (compiler: ModuleCompiler) => SetupOutput,
  handle?: (res: [Result<CompiledModules, unknown>, SetupOutput]) => void
) {
  const compiler = new ModuleCompiler();
  try {
    const output = setup(compiler);
    const result = compiler.compile();
    handle?.([result, output]);
  } finally {
    compiler.dispose();
  }
}
