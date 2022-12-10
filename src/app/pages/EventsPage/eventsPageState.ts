import create from "zustand";
import type { Action } from "@prisma/client";
import type { Reaction } from "@prisma/client";
import { isEqual } from "lodash";

type EventsPageObjectId =
  | { type: "action"; actionId: Action["actionId"] }
  | { type: "reaction"; reactionId: Reaction["reactionId"] };

export interface EventsPageState {
  activeObjectId?: EventsPageObjectId;
  setActiveObjectId: (id?: EventsPageObjectId) => void;
  onObjectDeleted: (id?: EventsPageObjectId) => void;
}

export const useEventsPageState = create<EventsPageState>((set, getState) => ({
  activeObjectId: undefined,
  setActiveObjectId: (id) => set({ activeObjectId: id }),
  onObjectDeleted(id) {
    const { activeObjectId } = getState();
    if (isEqual(activeObjectId, id)) {
      set({ activeObjectId: undefined });
    }
  },
}));
