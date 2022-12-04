import { z } from "zod";
import { zodTypeAtPath } from "./zodTypeAtPath";

describe("zodTypeAtPath", () => {
  it("should return the type at the given path without arrays", () => {
    const schema = z.object({
      foo: z.object({
        bar: z.string(),
      }),
    });
    const type = zodTypeAtPath(schema, "foo.bar");
    expect(type).toBeInstanceOf(z.ZodString);
  });
});
