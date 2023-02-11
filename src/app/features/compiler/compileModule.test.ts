/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import type { Result } from "neverthrow";
import type {
  AnyModuleOutputType,
  CompiledModule,
  CompiledModules,
  ModuleDefinition,
  ModuleOutputFunction,
} from "./compileModule";
import { ModuleCompiler } from "./compileModule";

describe("supports", () => {
  describe("return value", () => {
    testModuleOutputs("() => 5", (fn) => {
      expect(fn()).toEqual(5);
    });
  });

  describe("arguments", () => {
    testModuleOutputs("(a, b) => a + b", (fn) => {
      expect(fn(1, 2)).toEqual(3);
    });
  });

  describe("argument mutation", () => {
    testModuleOutputs("(a, b) => { a.x = 1; b.x = 2; }", (fn) => {
      const a = { x: 0 };
      const b = { x: 0 };
      fn(a, b);
      expect(a.x).toEqual(1);
      expect(b.x).toEqual(2);
    });
  });

  describe("detecting a module that does not call define", () => {
    const addSingleModule = (name: string) => (compiler: ModuleCompiler) =>
      compiler.addModule(name, { type: z.function(), code: "" });
    const addRecordModule = (name: string) => (compiler: ModuleCompiler) =>
      compiler.addModule(name, {
        type: z.object({ first: z.function(), second: z.function() }),
        code: "",
      });

    it("one module, single function", () => {
      expectModuleRequiredError(addRecordModule("fn"));
    });

    it("one module, function record", () => {
      expectModuleRequiredError(addRecordModule("record"));
    });

    it("two modules, single functions", () => {
      expectModuleRequiredError((compiler) => {
        addSingleModule("first")(compiler);
        addSingleModule("second")(compiler);
      });
    });

    it("two modules, function records", () => {
      expectModuleRequiredError((compiler) => {
        addRecordModule("first")(compiler);
        addRecordModule("second")(compiler);
      });
    });

    it("two modules, mixed", () => {
      expectModuleRequiredError((compiler) => {
        addSingleModule("fn")(compiler);
        addRecordModule("record")(compiler);
      });
    });
  });

  it("calling module A from module B", () => {
    const compiler = new ModuleCompiler();
    const moduleA = compiler.addModule("moduleA", {
      type: z.function(),
      code: `define((...args) => ["A", ...args])`,
    });
    const moduleB = compiler.addModule("moduleB", {
      type: z.function(),
      code: `define((...args) => moduleA("B", ...args))`,
      globals: { moduleA },
    });

    const result = compiler.compile();

    assert(result, () => {
      const res = moduleB("input");
      expect(res).toEqual(["A", "B", "input"]);
    });
  });

  it("using arguments mutated by another module during chained function call", () => {
    const compiler = new ModuleCompiler();

    const double = compiler.addModule("double", {
      type: z.function(),
      code: `define((state) => state.x *= 2)`,
    });

    const program = compiler.addModule("program", {
      type: z.function(),
      code: `define((state) => { state.x = 5; double(state); })`,
      globals: { double },
    });

    const result = compiler.compile();

    assert(result, () => {
      const state = { x: 0 };
      program(state);
      expect(state.x).toEqual(10);
    });
  });

  describe("global functions", () => {
    function test(path: [string, ...string[]]) {
      testCompiledModule(
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
});

function expectModuleRequiredError(setup: (compiler: ModuleCompiler) => void) {
  useCompilerResult(setup, ([result]) => {
    expect(result).toEqual(
      expect.objectContaining({
        error: `Compiler error: Error: No modules were defined`,
      })
    );
  });
}

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
  it("single function", () => {
    test(
      {
        code: `define(${functionDefinitionCode})`,
        type: z.function(),
      },
      assertion
    );
  });

  it("function record", () => {
    test(
      {
        type: z.object({ first: z.function(), second: z.function() }),
        code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
      },
      ({ first, second }, result) => {
        assertion(first, result);
        assertion(second, result);
      }
    );
  });
}

function testCompiledModule<Def extends ModuleDefinition>(
  definition: Def,
  assertion: CompilerAssertion<Def["type"]>
) {
  testCompilerResult(definition, (module, result) => {
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
  useCompilerResult(
    (compiler) => compiler.addModule("main", definition),
    ([result, module]) => assertion(module, result)
  );
}

function useCompilerResult<T extends AnyModuleOutputType, SetupOutput>(
  setup: (compiler: ModuleCompiler) => SetupOutput,
  handle: (res: [Result<CompiledModules, unknown>, SetupOutput]) => void
) {
  const compiler = new ModuleCompiler();
  try {
    const output = setup(compiler);
    const result = compiler.compile();
    handle([result, output]);
  } finally {
    compiler.dispose();
  }
}

function useCompiler(fn: (compiler: ModuleCompiler) => void) {
  const compiler = new ModuleCompiler();
  try {
    fn(compiler);
  } finally {
    compiler.dispose();
  }
}
