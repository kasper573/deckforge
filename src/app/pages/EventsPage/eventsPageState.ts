import create from "zustand";
import type { Action } from "@prisma/client";
import type { Reaction } from "@prisma/client";

type EventsPageObjectId =
  | { type: "action"; actionId: Action["actionId"] }
  | { type: "reaction"; reactionId: Reaction["reactionId"] };

export interface EventsPageState {
  activeObjectId?: EventsPageObjectId;
  setActiveObjectId: (id?: EventsPageObjectId) => void;
}

export const useEventsPageState = create<EventsPageState>((set) => ({
  activeObjectId: undefined,
  setActiveObjectId: (id?: EventsPageObjectId) => set({ activeObjectId: id }),
}));
