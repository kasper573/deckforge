import { z } from "zod";
import type { AnyFunction } from "js-interpreter";
import type { Result } from "neverthrow";
import type { Err } from "neverthrow";
import type {
  CompiledModule,
  CompiledModules,
  ModuleDefinition,
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

  it("detecting a module that does not define anything", () => {
    testCompilerResult({ type: z.function(), code: `` }, (result) => {
      expect(result.isErr()).toBe(true);
      expect((result as Err<unknown, unknown>).error).toEqual(
        `Compiler error: Error: No modules were defined`
      );
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
  assertion: (value: AnyFunction) => unknown
) {
  it("single function", () => {
    testCompiledModule(
      {
        code: `define(${functionDefinitionCode})`,
        type: z.function(),
      },
      assertion
    );
  });

  it("function record", () => {
    testCompiledModule(
      {
        type: z.object({ first: z.function(), second: z.function() }),
        code: `define({ first: ${functionDefinitionCode}, second: ${functionDefinitionCode} })`,
      },
      ({ first, second }) => {
        assertion(first);
        assertion(second);
      }
    );
  });
}

function testCompiledModule<Definition extends ModuleDefinition>(
  definition: Definition,
  assertion: (
    value: CompiledModule<Definition["type"]>,
    result: Result<CompiledModules, unknown>
  ) => unknown
) {
  testCompilerResult(definition, (result, module) => {
    assert(result, () => assertion(module, result));
  });
}

function testCompilerResult<Definition extends ModuleDefinition>(
  definition: Definition,
  assertion: (
    result: Result<CompiledModules, unknown>,
    module: CompiledModule<Definition["type"]>
  ) => unknown
) {
  const compiler = new ModuleCompiler();

  try {
    const module = compiler.addModule("main", definition);
    const result = compiler.compile();
    assertion(result, module);
  } finally {
    compiler.dispose();
  }
}
