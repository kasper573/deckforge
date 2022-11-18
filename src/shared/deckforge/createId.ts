import { v4 } from "uuid";

type NominalString<Token extends string> = `NominalString<${Token}>`;

export type Id<Name extends string = string> = NominalString<Name>;

export const createId = v4 as <T extends Id>() => T;
