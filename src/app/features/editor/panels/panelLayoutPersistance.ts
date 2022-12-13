import type { ZodType } from "zod";
import { z } from "zod";
import type { PanelLayout } from "./definition";
import { panelIdType } from "./definition";

const panelLayoutType: ZodType<PanelLayout> = panelIdType.or(
  z.object({
    direction: z.enum(["row", "column"]),
    first: z.lazy(() => panelLayoutType),
    second: z.lazy(() => panelLayoutType),
    splitPercentage: z.number().optional(),
  })
);

export function savePanelLayout(newLayout: PanelLayout) {
  localStorage.setItem(localStorageKey, JSON.stringify(newLayout));
}

export function loadPanelLayout(): PanelLayout | undefined {
  try {
    return panelLayoutType.parse(
      JSON.parse(localStorage.getItem(localStorageKey) ?? "")
    );
  } catch {}
}

const localStorageKey = "panel-layout" as const;
