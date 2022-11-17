import type { Opaque } from "ts-essentials";
import {v4} from "uuid";

export type Id<GloballyUniqueName extends string = string> = Opaque<string, GloballyUniqueName>;

export const createId = v4 as <T extends Id>() => T
