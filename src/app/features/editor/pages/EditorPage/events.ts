import { createEventBus } from "../../../../../lib/createEventBus";
import type { PanelId } from "../../types";

export const showEditorHelp = createEventBus<PanelId | undefined>();
