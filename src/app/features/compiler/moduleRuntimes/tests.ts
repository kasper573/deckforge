/* eslint-disable react-hooks/rules-of-hooks */
import type { ZodType } from "zod";
import { z } from "zod";
import { get, range } from "lodash";
import produce from "immer";
import type { ZodTypeAny } from "zod/lib/types";
import type { AnyFunction } from "../../../../lib/ts-extensions/types";
import type {
  ModuleDefinition,
  ModuleCompiler,
  CompiledFunctionModule,
} from "./types";
import type { ModuleCompilerResult } from "./types";
import { ModuleReference } from "./types";

export function generateModuleRuntimeTests(
  createCompiler: () => ModuleCompiler
) {
  const t = createRuntimeTestUtils(createCompiler);

  it("supports typescript", () =>
    t.assertValidRuntime(
      (compiler) =>
        compiler.addModule({
          name: "getSorted",
          type: z.function().returns(
            z.object({
              sortedNumbers: z.array(z.number()),
              sortedStrings: z.array(z.string()),
            })
          ),
          code: `
          define(() => {
            const numbers: number[] = [3,1,2];
            const strings: string[] = ["c", "a", "b"];
            const sortedNumbers = numbers.sort(compare);
            const sortedStrings = strings.sort(compare);
            return { sortedNumbers, sortedStrings };
          });
          
          function compare <T> (a: T, b: T) {
            return a < b ? -1 : a > b ? 1 : 0;
          }
        `,
        }),
      (fn) => {
        expect(fn()).toEqual({
          sortedNumbers: [1, 2, 3],
          sortedStrings: ["a", "b", "c"],
        });
      }
    ));

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
        compiler.addModule({
          name: "module",
          type: z.function(),
          code: ``,
        });
      });
    });
  });

  describe("return value", () =>
    t.testModuleOutputs("() => 5", [], (fn) => {
      expect(fn()).toEqual(5);
    }));

  describe("arguments", () =>
    t.testModuleOutputs("(a, b) => a + b", [z.unknown(), z.unknown()], (fn) => {
      expect(fn(1, 2)).toEqual(3);
    }));

  describe("disallow circular references", () => {
    describe("in function arguments", () =>
      t.testModuleOutputs(`(arg) => {}`, [z.unknown()], (fn) => {
        const circular = createCircular();
        expect(() => fn(circular)).toThrowError(
          "Circular reference found in args.0.children.0"
        );
      }));

    it("in module globals", () =>
      t.useRuntime(
        (compiler) =>
          compiler.addModule({
            name: "main",
            code: "",
            type: z.function(),
            globals: { circular: createCircular() },
          }),
        (result) => {
          expect(result).toEqual(
            expect.objectContaining({
              error: {
                main: new Error(
                  "Circular reference found in globals.circular.children.0"
                ),
              },
            })
          );
        }
      ));

    function createCircular() {
      type Node = { x: number; children: Node[] };
      const node: Node = { x: 0, children: [] };
      node.children.push(node);
      return node;
    }
  });

  describe("argument mutation", () => {
    describe("root", () => testMutationsFor());
    describe("nested", () => testMutationsFor(["a", "b", "c"]));
    describe("nested proxy", () => testMutationsFor(["a", "b", "c"], produce));

    function testMutationsFor(
      ...args: Parameters<typeof createMutationsTesterFor>
    ) {
      const testMutations = createMutationsTesterFor(...args);

      describe("object property", () =>
        testMutations(
          (v) => `${v}.x = 10`,
          () => ({ x: 0 }),
          (o) => o.x,
          10
        ));

      describe("array index (out of bounds)", () =>
        testMutations(
          (v) => `${v}[0] = 10`,
          () => [],
          (o) => o[0],
          10
        ));

      describe("array index (within bounds)", () =>
        testMutations(
          (v) => `${v}[1] = 10`,
          () => [1, 2, 3],
          (o) => o,
          [1, 10, 3]
        ));

      describe("array push (empty array)", () =>
        testMutations(
          (v) => `${v}.push(10)`,
          () => [],
          (array) => array,
          [10]
        ));

      describe("array push (has existing items)", () =>
        testMutations(
          (v) => `${v}.push(10)`,
          () => [1, 2, 3],
          (array) => array,
          [1, 2, 3, 10]
        ));

      describe("array pop", () =>
        testMutations(
          (v) => `${v}.pop()`,
          () => [1, 2, 3],
          (array) => array,
          [1, 2]
        ));

      describe("array shift", () =>
        testMutations(
          (v) => `${v}.shift()`,
          () => [1, 2, 3],
          (array) => array,
          [2, 3]
        ));

      describe("array unshift", () =>
        testMutations(
          (v) => `${v}.unshift(10)`,
          () => [1, 2, 3],
          (array) => array,
          [10, 1, 2, 3]
        ));

      describe("array splice", () =>
        testMutations(
          (v) => `${v}.splice(1, 2, 10, 20)`,
          () => [1, 2, 3, 4],
          (array) => array,
          [1, 10, 20, 4]
        ));
    }

    function createMutationsTesterFor(
      path: string[] = [],
      produce?: Producer
    ): typeof testMutations {
      const pathAccessCode = path.length ? `.${path.join(".")}` : "";
      return (
        createMutationCode,
        createInitializer,
        getCurrentValue,
        expectedValue,
        specificProducer = produce
      ) =>
        testMutations(
          (paramName) => createMutationCode(paramName + pathAccessCode),
          () => valueAtPath(path, createInitializer()),
          (root) =>
            getCurrentValue(path.length ? get(root, path.join(".")) : root),
          expectedValue,
          specificProducer
        );
    }

    type Producer = <V>(values: V, mutate: (values: V) => V) => V;

    function testMutations<T, R>(
      createMutationCode: (parameterName: string) => string,
      createInitializer: () => T,
      getCurrentValue: (o: T) => R,
      expectedValue: R,
      produce: Producer = (values, mutate) => {
        mutate(values);
        return values;
      }
    ) {
      for (const n of [1, 2, 3]) {
        describe(`${n} parameter${n ? "s" : ""} mutated`, () => {
          const variableNames = range(n).map((i) => `a${i}`);
          return t.testModuleOutputs(
            `(${variableNames.join(",")}) => { 
            ${variableNames.map(createMutationCode).join(";")} 
            }`,
            variableNames.map(() => z.unknown()),
            (fn) => {
              let values = variableNames.map(createInitializer);
              values = produce(values, (draft) => fn(...draft));
              const updatedValues = values.map(getCurrentValue);
              const expectedValues = new Array(n).fill(expectedValue);
              expect(updatedValues).toEqual(expectedValues);
            }
          );
        });
      }

      describe(`two parameters: first mutated, second untouched`, () =>
        t.testModuleOutputs(
          `(a, b) => { 
            ${createMutationCode("a")};
          }`,
          [z.unknown(), z.unknown()],
          (fn) => {
            let values = [createInitializer(), createInitializer()];
            values = produce(values, (draft) => fn(...draft));
            const updatedValues = values.map(getCurrentValue);
            expect(updatedValues).toEqual([
              expectedValue,
              getCurrentValue(createInitializer()),
            ]);
          }
        ));
    }
  });

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
          type: z.object({
            empty: z.function(),
            defined: z.function(),
          }),
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
            type: z.function().args(z.unknown()),
            code: `define((args) => ["A", ...args])`,
          });
          const moduleB = compiler.addModule({
            name: "moduleB",
            type: z.function().args(z.unknown()),
            code: `define((arg) => moduleA(["B", arg]))`,
            globals: { moduleA },
          });
          return moduleB;
        },
        (moduleB) => {
          const res = moduleB("input");
          expect(res).toEqual(["A", "B", "input"]);
        }
      ));

    it("calling module A from module B via function reference", () =>
      t.assertValidRuntime(
        (compiler) => {
          compiler.addModule({
            name: "moduleA",
            type: z.function().args(z.unknown()),
            code: `define((args) => ["A", ...args])`,
          });
          const moduleB = compiler.addModule({
            name: "moduleB",
            type: z.function().args(z.unknown()),
            code: `define((arg) => moduleA(["B", arg]))`,
            globals: {
              moduleA: new ModuleReference("moduleA", z.function()),
            },
          });
          return moduleB;
        },
        (moduleB) => {
          const res = moduleB("input");
          expect(res).toEqual(["A", "B", "input"]);
        }
      ));

    it("calling module A from module B via object reference", () =>
      t.assertValidRuntime(
        (compiler) => {
          const moduleAType = z.object({ foo: z.function().args(z.unknown()) });
          compiler.addModule({
            name: "moduleA",
            type: moduleAType,
            code: `define({ foo: (args) => ["A", ...args]})`,
          });
          const moduleB = compiler.addModule({
            name: "moduleB",
            type: z.function().args(z.unknown()),
            code: `define((arg) => moduleA.foo(["B", arg]))`,
            globals: { moduleA: new ModuleReference("moduleA", moduleAType) },
          });
          return moduleB;
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

    describe("argument mutation", () => {
      it("module A arguments being mutated by module B", () =>
        t.assertValidRuntime(
          (compiler) => {
            const double = compiler.addModule({
              name: "double",
              type: z.function().args(z.unknown()),
              code: `define((state) => state.x *= 2)`,
            });

            return compiler.addModule({
              name: "program",
              type: z.function().args(z.unknown()),
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

      describe("when called from", () => {
        it("for loop", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            for (let i = 0; i < ${arrayRef}.length; i++) {
              const ${varName} = ${arrayRef}[i];
              ${blockCode}
            }
          `
          );
        });

        it("for loop (IIFE)", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            for (let i = 0; i < ${arrayRef}.length; i++) {
              ((${varName}) => {
                ${blockCode}
              })(${arrayRef}[i]);
            }
          `
          );
        });

        it("looped recursion", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            loop(0);
            
            function loop(i) {
              if (i < ${arrayRef}.length) {
                ((${varName}) => {
                  ${blockCode}
                })(${arrayRef}[i]);
                loop(i + 1);
              }
            }
          `
          );
        });

        it("for in", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            for (let i in ${arrayRef}) {
              const ${varName} = ${arrayRef}[i];
              ${blockCode}
            }
          `
          );
        });

        it("for of", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            for (const ${varName} of ${arrayRef}) {
              ${blockCode}
            }
          `
          );
        });

        it(".forEach", () => {
          testOne(
            (arrayRef, varName, blockCode) => `
            ${arrayRef}.forEach((${varName}) => {
              ${blockCode}
            });
          `
          );
        });

        function testOne(
          createLoopCode: (
            arrayRef: string,
            varName: string,
            blockCode: string
          ) => string
        ) {
          t.assertValidRuntime(
            (compiler) => {
              const damage = compiler.addModule({
                name: "damage",
                type: z.function().args(z.unknown(), z.number(), z.number()),
                code: `define((state, playerId, amount) => {
                  const player = state.players.find(p => p.id === playerId);
                  player.properties.health -= amount;
                })`,
              });

              return compiler.addModule({
                name: "program",
                type: z.function().args(z.unknown(), z.unknown()),
                code: `define((state, health) => {
                  ${createLoopCode(
                    "state.players",
                    "player",
                    `
                    player.properties.health = health.initial;
                    damage(state, player.id, health.damage);
                  `
                  )}
                })`,
                globals: { damage },
              });
            },
            (program) => {
              const create = (health: number) => ({
                players: [
                  { id: 0, properties: { health } },
                  { id: 1, properties: { health } },
                ],
              });
              const state = create(0);
              program(state, { initial: 10, damage: 3 });
              expect(state).toEqual(create(7));
            }
          );
        }
      });
    });
  });

  describe("global functions", () => {
    function test(path: [string, ...string[]]) {
      return t.testModuleOutput(
        {
          type: z.function().args(z.unknown()),
          code: `define((args) => ${path.join(".")}(...args))`,
          globals: valueAtPath(path, (...args: unknown[]) => [path, ...args]),
        },
        (fn) => {
          expect(fn([1, 2])).toEqual([path, 1, 2]);
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
              globals: valueAtPath(path, value),
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
              globals: valueAtPath(path, [value]),
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

  describe("global builtin overrides", () => {
    it("can override Math.random", () => {
      t.testModuleOutput(
        {
          type: z.function(),
          globals: { Math: { random: () => 0.5 } },
          code: `define(() => Math.random())`,
        },
        (fn) => {
          expect(fn()).toEqual(0.5);
        }
      );
    });

    it("can override Math.random without affecting other Math members", () => {
      t.testModuleOutput(
        {
          type: z.function(),
          globals: { Math: { random: () => 0.5 } },
          code: `define(() => Math.abs(-5))`,
        },
        (fn) => {
          expect(fn()).toEqual(5);
        }
      );
    });
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
  function testModuleOutputs(
    functionDefinitionCode: string,
    argTypes: ZodTypeAny[],
    assert: (output: CompiledFunctionModule) => void
  ) {
    const fnType = z
      .function()
      .args(...(argTypes as [ZodTypeAny, ...ZodTypeAny[]] | []));
    it("optional single function (assert bypass)", () =>
      testModuleOutput(
        {
          code: `define(${functionDefinitionCode})`,
          type: fnType.optional() as ZodType<AnyFunction>,
        },
        assert
      ));

    it("single function", () =>
      testModuleOutput(
        {
          code: `define(${functionDefinitionCode})`,
          type: fnType,
        },
        assert
      ));

    it("function record", () =>
      testModuleOutput(
        {
          type: z.object({ first: fnType, second: fnType }),
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
          type: z.object({ first: fnType, second: fnType }).partial(),
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
    handle?: (result: ModuleCompilerResult, setupOutput: T) => void
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
    testModuleOutputs,
    testModuleOutput,
    assertValidRuntime,
    useRuntime,
  };
}

function valueAtPath(path: string[], leafValue: unknown) {
  return path.reduceRight(
    (acc: object, key) => ({ [key]: acc }),
    leafValue as object
  );
}
