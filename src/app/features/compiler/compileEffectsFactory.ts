import { z } from "zod";
import type { SafeParseReturnType } from "zod/lib/types";
import { cardType } from "../../../api/services/game/types";

const effectType = z.function().args(z.any()).returns(z.any());
const effectsType = z.record(z.array(effectType));
const effectsFactoryType = z.function().args(cardType).returns(effectsType);
type EffectsFactory = z.infer<typeof effectsFactoryType>;

export function compileEffectsFactory(
  code: string
): SafeParseReturnType<string, EffectsFactory> {
  code = code.trim();
  if (!code) {
    return { success: true, data: () => ({}) };
  }
  return effectsFactoryType.safeParse(eval(`(${code})`));
}
