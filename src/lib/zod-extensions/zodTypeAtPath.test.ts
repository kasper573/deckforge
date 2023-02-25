import type { ZodOptional, ZodString } from "zod";
import { z } from "zod";
import { zodTypeAtPath } from "./zodTypeAtPath";

describe("returns the type at the given path", () => {
  it("for optional leafs", () => {
    const schema = z.object({
      foo: z.object({
        bar: z.string().optional(),
      }),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodOptional);
    expect((type as ZodOptional<ZodString>)._def.innerType).toBeInstanceOf(
      z.ZodString
    );
  });

  it("for plain objects", () => {
    const schema = z.object({
      foo: z.object({
        bar: z.string(),
      }),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for refined objects", () => {
    const schema = z.object({
      foo: z
        .object({
          bar: z.string(),
        })
        .refine(() => true, { message: "foo.bar" }),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for partial objects", () => {
    const schema = z
      .object({
        foo: z.object({
          bar: z.string(),
        }),
      })
      .partial();
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for objects with optional properties", () => {
    const schema = z.object({
      foo: z
        .object({
          bar: z.string(),
        })
        .optional(),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for objects with nullable properties", () => {
    const schema = z.object({
      foo: z
        .object({
          bar: z.string(),
        })
        .nullable(),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for objects with nullish properties", () => {
    const schema = z.object({
      foo: z
        .object({
          bar: z.string(),
        })
        .nullish(),
    });
    const type = zodTypeAtPath(schema, ["foo", "bar"]);
    expect(type).toBeInstanceOf(z.ZodString);
  });

  it("for union objects", () => {
    const schema = z.object({
      foo: z
        .object({
          bar: z.string(),
        })
        .and(
          z.object({
            baz: z.number(),
          })
        ),
    });
    const bar = zodTypeAtPath(schema, ["foo", "bar"]);
    const baz = zodTypeAtPath(schema, ["foo", "baz"]);
    expect(bar).toBeInstanceOf(z.ZodString);
    expect(baz).toBeInstanceOf(z.ZodNumber);
  });
});
