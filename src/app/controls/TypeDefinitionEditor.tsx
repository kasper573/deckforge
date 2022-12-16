import { useMemo } from "react";
import type { ZodType } from "zod";
import type {
  PrimitiveName,
  TypeDefinition,
} from "../../lib/zod-extensions/createTypeDefinition";
import { createTypeDefinition } from "../../lib/zod-extensions/createTypeDefinition";
import { ZodControl } from "./ZodControl";

export interface TypeDefinitionEditorProps<PD extends PrimitiveName> {
  primitives: ZodType<PD>;
  value: TypeDefinition<PD>;
  onChange: (value: TypeDefinition<PD>) => void;
}

export function TypeDefinitionEditor<PD extends PrimitiveName>({
  primitives,
  value,
  onChange,
}: TypeDefinitionEditorProps<PD>) {
  const schema = useMemo(() => createTypeDefinition(primitives), [primitives]);
  return <ZodControl schema={schema} value={value} onChange={onChange} />;
}
