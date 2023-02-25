import type { ZodType } from "zod";
import { z } from "zod";
import { createZodProxy } from "./createZodProxy";

describe("createZodProxy", () => {
  it("can read number", () => {
    const schema = z.object({ prop: z.number() });
    const obj = { prop: 1 };
    const proxy = createTestProxy(schema, obj);
    expect(proxy.prop).toBe(1);
  });

  it("can call function", () => {
    const schema = z.object({ fn: z.function() });
    const obj = { fn: () => "result" };
    const proxy = createTestProxy(schema, obj);
    expect(proxy.fn()).toBe("result");
  });

  it("can read nested number", () => {
    const schema = z.object({ nested: z.object({ num: z.number() }) });
    const obj = { nested: { num: 1 } };
    const proxy = createTestProxy(schema, obj);
    expect(proxy.nested.num).toBe(1);
  });

  it("can call nested function", () => {
    const schema = z.object({ nested: z.object({ fn: z.function() }) });
    const obj = { nested: { fn: () => "result" } };
    const proxy = createTestProxy(schema, obj);
    expect(proxy.nested.fn()).toBe("result");
  });

  it("can call root function", () => {
    const schema = z.function();
    const fn = () => "result";
    const proxy = createTestProxy(schema, fn);
    expect(proxy()).toBe("result");
  });
});

function createTestProxy<T extends ZodType>(type: T, target: z.infer<T>) {
  return createZodProxy(type, (path, typeAtPath) =>
    typeAtPath.parse(path.reduce((acc, key) => acc[key], target))
  );
}
