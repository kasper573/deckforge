import type { ZodType } from "zod";
import { z } from "zod";
import { zodToTS } from "./zodToTS";

const expectations = [
  { name: "string", type: z.string(), expected: "string" },
  { name: "number", type: z.number(), expected: "number" },
  { name: "boolean", type: z.boolean(), expected: "boolean" },
  { name: "date", type: z.date(), expected: "Date" },
  { name: "bigint", type: z.bigint(), expected: "bigint" },
  { name: "void", type: z.void(), expected: "void" },
  { name: "unknown", type: z.unknown(), expected: "unknown" },
  { name: "null", type: z.null(), expected: "null" },
  { name: "undefined", type: z.undefined(), expected: "undefined" },
  { name: "any", type: z.any(), expected: "any" },
  { name: "never", type: z.never(), expected: "never" },
  { name: "literal", type: z.literal("foo"), expected: `"foo"` },
  { name: "enum", type: z.enum(["foo", "bar"]), expected: `"foo" | "bar"` },
  { name: "array", type: z.array(z.string()), expected: "string[]" },
  {
    name: "tuple",
    type: z.tuple([z.string(), z.number()]),
    expected: "[string, number]",
  },
  {
    name: "object (single property)",
    type: z.object({ foo: z.string() }),
    expected: "{ foo: string }",
  },
  {
    name: "object (multiple properties)",
    type: z.object({ foo: z.string(), bar: z.number() }),
    expected: "{\n\tfoo: string;\n\tbar: number\n}",
  },
  {
    name: "union",
    type: z.union([z.string(), z.number()]),
    expected: "string | number",
  },
  {
    name: "intersection",
    type: z.intersection(z.string(), z.number()),
    expected: "string & number",
  },
  {
    name: "partial",
    type: z.object({ foo: z.string() }).partial(),
    expected: "{ foo?: string }",
  },
  {
    name: "optional object",
    type: z.object({ foo: z.string() }).optional(),
    expected: "{ foo: string } | undefined",
  },
  {
    name: "optional property",
    type: z.object({ foo: z.string().optional() }),
    expected: "{ foo?: string }",
  },
  {
    name: "optional property with default",
    type: z.object({ foo: z.string().optional().default("bar") }),
    expected: "{ foo?: string }",
  },
];

describe("zodToTS", () => {
  for (const { name, type, expected } of expectations) {
    it(`Can convert ${name} to TS`, () => {
      expect(zodToTS(type)).toEqual(expected);
    });
  }

  it("Can convert recursive types", () => {
    type Node = { id: string; children: Node[] };
    const circularNode = z.lazy(() => node);
    const node: ZodType<Node> = z.object({
      id: z.string(),
      children: z.array(circularNode),
    });

    expect(
      zodToTS(node, { lazyResolvers: new Map([[circularNode, "Node"]]) })
    ).toBe(`{\n\tid: string;\n\tchildren: Node[]\n}`);
  });
});
