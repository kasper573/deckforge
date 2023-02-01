import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import { editorObjectIdType, panelLayoutType } from "./types";
import { defaultPanelLayout } from "./panels/defaultPanelLayout";

export const panelStorage = createZodStorage(
  panelLayoutType,
  "panel-layout",
  defaultPanelLayout
);

export const selectedObjectStorage = createZodStorage(
  editorObjectIdType,
  "selected-object"
);
