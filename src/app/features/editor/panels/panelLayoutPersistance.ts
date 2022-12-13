import type { MosaicNode } from "react-mosaic-component/src/types";
import type { ZodType } from "zod";
import { z } from "zod";
import type { MosaicParent } from "react-mosaic-component";
import type { PanelId } from "./definition";
import { panelIdType } from "./definition";

const mosaicParentType: ZodType<MosaicParent<PanelId>> = z.object({
  direction: z.enum(["row", "column"]),
  first: z.lazy(() => mosaicNodeType),
  second: z.lazy(() => mosaicNodeType),
  splitPercentage: z.number().optional(),
});

const mosaicNodeType: ZodType<MosaicNode<PanelId>> =
  panelIdType.or(mosaicParentType);

export function saveUserDefaultPanelLayout(
  newUserDefault: MosaicNode<PanelId> | null
) {
  localStorage.setItem(
    localStorageKey,
    JSON.stringify(newUserDefault ?? builtinDefaultPanelLayout)
  );
}

export function loadUserDefaultPanelLayout(): MosaicNode<PanelId> {
  try {
    return mosaicNodeType.parse(
      JSON.parse(localStorage.getItem(localStorageKey) ?? "")
    );
  } catch {
    return builtinDefaultPanelLayout;
  }
}

const localStorageKey = "panelLayout" as const;
const builtinDefaultPanelLayout = {
  direction: "row",
  first: "code",
  second: {
    direction: "column",
    first: "inspector",
    second: "project",
    splitPercentage: 20,
  },
  splitPercentage: 70,
} as const;
