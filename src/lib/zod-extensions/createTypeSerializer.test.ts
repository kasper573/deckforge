import { z } from "zod";
import { createSerializableType } from "./createTypeSerializer";

describe("createTypeSerializer", () => {
  it("undefined becomes default value", () => {
    const type = createSerializableType({ num: z.number() }, { num: 0 });
    const deserialized = type.serializedType.parse("num");
    const resolver = type.valueTypeOf(deserialized);
    const parsed = resolver.parse(undefined);
    expect(parsed).toEqual(0);
  });

  it("number value of 123 is parsed properly", () => {
    const type = createSerializableType({ num: z.number() }, { num: 0 });
    const deserialized = type.serializedType.parse("num");
    const resolver = type.valueTypeOf(deserialized);
    const parsed = resolver.parse(123);
    expect(parsed).toEqual(123);
  });

  it("unknown type name cannot be parsed", () => {
    const type = createSerializableType({ num: z.number() }, { num: 0 });
    const result = type.serializedType.safeParse("other");
    expect(result.success).toEqual(false);
  });

  it(`shape {foo: "num"} is parsed properly`, () => {
    const type = createSerializableType({ num: z.number() }, { num: 0 });
    const deserialized = type.serializedType.parse({ foo: "num" });
    const resolver = type.valueTypeOf(deserialized);
    const parsed = resolver.parse({ foo: 123 });
    expect(parsed).toEqual({ foo: 123 });
  });
});
