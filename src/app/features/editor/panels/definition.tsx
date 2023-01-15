import type { ComponentType, ReactNode } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import Link from "@mui/material/Link";
import type { PanelId } from "../types";
import { useModal } from "../../../../lib/useModal";
import { AlertDialog } from "../../../dialogs/AlertDialog";
import type { TourStep } from "../../../components/Tour";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel/CodePanel";
import { InspectorPanel } from "./InspectorPanel/InspectorPanel";
import { CardPropertiesPanel, PlayerPropertiesPanel } from "./PropertiesPanel";
import { RuntimePanel } from "./RuntimePanel";
import { MiddlewaresPanel } from "./MiddlewaresPanel";
import { LogsPanel } from "./LogsPanel";

export interface PanelProps {
  path: MosaicBranch[];
  title: ReactNode;
  draggable?: boolean;
  className?: string;
}

export interface PanelDefinition {
  component: ComponentType<PanelProps>;
  title: string;
  tour?: TourStep;
}

export const panelsDefinition: Record<PanelId, PanelDefinition> = {
  runtime: {
    component: RuntimePanel,
    title: "Runtime",
    tour: {
      className: "tour-runtime",
      content: (
        <>
          The runtime panel shows the current state of the game and allows you
          to interact with it.
        </>
      ),
    },
  },
  code: {
    component: CodePanel,
    title: "Code",
    tour: {
      className: "tour-code",
      content: (
        <>
          <p>
            The code panel allows you to edit the code for the currently
            selected event, middleware or card.
          </p>
          <p>
            Deck forge uses javascript, with type hints provided by typescript
            types. Click the API Reference button to see definitions of all
            types and functions available for the currently selected object.
          </p>
          <p>
            In your code, call either the <code>define</code> or{" "}
            <code>derive</code> functions to describe what your object does.
          </p>
        </>
      ),
    },
  },
  inspector: {
    component: InspectorPanel,
    title: "Inspector",
    tour: {
      className: "tour-inspector",
      content: (
        <>
          The inspector panel shows and allows editing of additional information
          of the currently selected object.
        </>
      ),
    },
  },
  decks: {
    component: DecksPanel,
    title: "Decks",
    tour: {
      className: "tour-decks",
      content: (
        <>
          <p>
            The decks panel allows editing the decks and cards that should be
            available in the game. Right click to add, remove or rename decks
            and cards.
          </p>
          <p>
            Selecting a card will allow you to edit its behavior in the code
            panel. A cards code defines a record of{" "}
            <StateReducer>state reducers</StateReducer>, where the key is the
            name of an event to react to. This allows you to completely
            customize how the card should behave.
          </p>
        </>
      ),
    },
  },
  events: {
    component: EventsPanel,
    title: "Events",
    tour: {
      className: "tour-events",
      content: (
        <>
          <p>The events panel allows you to add, remove and edit events.</p>
          <p>
            The code for an event is a <StateReducer />. The game runtime will
            automatically trigger the right built-in events and the right time,
            but you will also be able to trigger them manually from code.
          </p>
          <p>Right click to add, remove or rename events.</p>
        </>
      ),
    },
  },
  middlewares: {
    component: MiddlewaresPanel,
    title: "Middlewares",
    tour: {
      className: "tour-middlewares",
      content: (
        <>
          <p>
            Middlewares are <StateReducer /> functions that run for all events.
            They can be used to intercept and modify the game state. Middlewares
            are applied in the order they are listed, and if a middleware does
            not call its next function the middleware chain stops there.
          </p>

          <p>Right click to add, remove or rename middlewares.</p>
        </>
      ),
    },
  },
  cardProperties: {
    component: CardPropertiesPanel,
    title: "Card Properties",
    tour: {
      className: "tour-card-properties",
      content: (
        <>
          <p>
            Card properties define what state exists on all cards. Each property
            has a name, type and default value.
          </p>
          <p>Right click to add, remove or rename properties.</p>
        </>
      ),
    },
  },
  playerProperties: {
    component: PlayerPropertiesPanel,
    title: "Player Properties",
    tour: {
      className: "tour-player-properties",
      content: (
        <>
          <p>
            Player properties define what state exists on all players. Each
            property has a name, type and default value.
          </p>
          <p>Right click to add, remove or rename properties.</p>
        </>
      ),
    },
  },
  logs: {
    component: LogsPanel,
    title: "Logs",
    tour: {
      className: "tour-logs",
      content: (
        <>
          The logs panel shows compiler and runtime errors, and events as they
          happen in the game runtime.
        </>
      ),
    },
  },
};

function StateReducer({
  children = "state reducer",
}: {
  children?: ReactNode;
}) {
  const alert = useModal(AlertDialog);
  return (
    <Link
      sx={{ cursor: "pointer" }}
      onClick={() =>
        alert({
          title: "State reducer",
          content: (
            <>
              A state reducer is a function that will takes two parameters: The
              runtime state object, and a payload. The purpose is to use the
              payload to make mutations to the state object. Any mutations made
              to will only be applied to the game state once the reducer has
              finished processing.
            </>
          ),
        })
      }
    >
      {children}
    </Link>
  );
}

export const panelDefinitionList = Object.entries(panelsDefinition).map(
  ([id, def]) => ({ id: id as PanelId, ...def })
);
