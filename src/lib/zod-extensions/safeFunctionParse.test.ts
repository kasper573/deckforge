import { z } from "zod";
import { safeFunctionParse } from "./safeFunctionParse";

describe("safeFunctionParse", () => {
  it("calls parsed function only once", () => {
    const spy = jest.fn();
    const fn = safeFunctionParse(z.function(), spy);
    fn();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe("function without type information", () => {
    it("ignores arguments", () => {
      const spy = jest.fn();
      const fn = safeFunctionParse(z.function(), spy);
      fn(1, 2, 3);
      expect(spy).toHaveBeenCalledWith();
    });

    it("can return a value", () => {
      const fn = safeFunctionParse(z.function(), () => 123);
      expect(fn()).toBe(123);
    });
  });

  describe("function with argument type", () => {
    it("throws on invalid argument type", () => {
      const type = z.function().args(z.string());
      const fn = safeFunctionParse(type, () => {});
      expect(() => fn(123 as never)).toThrow(
        /expected string, received number/i
      );
    });

    it("throws on invalid argument type (one of many)", () => {
      const type = z.function().args(z.number(), z.string(), z.boolean());
      const fn = safeFunctionParse(type, () => {});
      expect(() => fn(123, {} as string, false)).toThrow(
        /expected string, received object/i
      );
    });

    it("does not receive excess arguments", () => {
      const type = z.function().args(z.number(), z.string());
      const spy = jest.fn();
      const fn = safeFunctionParse(type, spy);
      const excess = [true, false, null, undefined];
      fn(123, "foo", ...excess);
      expect(spy).toHaveBeenCalledWith(123, "foo");
    });

    it("can mutate arguments", () => {
      const argType = z.object({ count: z.number() });
      const fnType = z.function().args(argType);

      const increase = safeFunctionParse(
        fnType,
        (obj: z.infer<typeof argType>) => {
          obj.count++;
        }
      );

      const obj = { count: 0 };
      increase(obj);
      expect(obj).toEqual({ count: 1 });
    });
  });

  describe("function with return type", () => {
    it("throws on invalid return type", () => {
      const fn = safeFunctionParse(z.function().returns(z.string()), () => 123);
      expect(fn).toThrow(/expected string, received number/i);
    });

    it("returns value on matching return type", () => {
      const fn = safeFunctionParse(
        z.function().returns(z.string()),
        () => "123"
      );
      expect(fn()).toEqual("123");
    });

    it("returns exact instance on matching return type", () => {
      const instance = { foo: "bar" };
      const type = z.object({ foo: z.string() });
      const fn = safeFunctionParse(z.function().returns(type), () => instance);
      expect(fn()).toBe(instance);
    });
  });
});
