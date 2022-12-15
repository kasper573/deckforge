import { v4 } from "uuid";
import type { NominalString } from "../../../lib/NominalString";

export type Id<Name extends string = string> = NominalString<Name>;

export const createId = v4 as <T extends Id>() => T;
