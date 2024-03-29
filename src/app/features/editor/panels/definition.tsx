import type { ComponentType, ReactNode } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { memo } from "react";
import { isEqual } from "lodash";
import type { PanelId } from "../types";
import { useModal } from "../../../../lib/useModal";
import { AlertDialog } from "../../../dialogs/AlertDialog";
import type { TourStep } from "../../../components/Tour";
import { symbols } from "../../compiler/moduleRuntimes/symbols";
import { colors } from "../../log/colors";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel/CodePanel";
import { InspectorPanel } from "./InspectorPanel/InspectorPanel";
import { CardPropertiesPanel, PlayerPropertiesPanel } from "./PropertiesPanel";
import { RuntimePanel } from "./RuntimePanel/RuntimePanel";
import { ReducersPanel } from "./ReducersPanel";
import { LogsPanel } from "./LogsPanel";

export interface PanelProps {
  path: MosaicBranch[];
  title: string;
  draggable?: boolean;
  className?: string;
}

export interface PanelDefinition {
  component: ComponentType<PanelProps>;
  title: string;
  tour: TourStep;
}

export const panelsDefinition: Record<PanelId, PanelDefinition> = {
  runtime: {
    component: memo(RuntimePanel, isEqual),
    title: "Runtime",
    tour: {
      className: "tour-runtime",
      content: (
        <>
          <Typography paragraph>
            The runtime panel shows the current state of the game and allows you
            to interact with it.
          </Typography>
          <Typography>
            Whenever you make a change to the game code or settings, the game
            will recompile automatically and restart (you can also manually
            trigger a recompile by using the runtime {`panel's`} toolbar).
          </Typography>
        </>
      ),
    },
  },
  inspector: {
    component: memo(InspectorPanel, isEqual),
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
    component: memo(DecksPanel, isEqual),
    title: "Decks",
    tour: {
      className: "tour-decks",
      content: (
        <>
          <Typography paragraph>
            The decks panel contains all the decks and cards that will be
            available in your game.
          </Typography>
          <Typography paragraph>
            Selecting a card will allow you to edit its behavior in the code
            panel. The code for a card should define a record of{" "}
            <StateReducer>state reducers</StateReducer>, where the key is the
            name of an event to react to. This allows you to completely
            customize how the card should behave.
          </Typography>
          <Typography>
            Right click to add, remove or rename decks and cards.
          </Typography>
        </>
      ),
    },
  },
  code: {
    component: memo(CodePanel, isEqual),
    title: "Code",
    tour: {
      className: "tour-code",
      content: (
        <>
          <Typography paragraph>
            The code panel allows you to edit the code for the currently
            selected event, reducer or card.
          </Typography>
          <Typography paragraph>
            Deck Forge uses TypeScript. Click the <code>API Reference</code>{" "}
            button in the code panel toolbar to see definitions of all types and
            functions available for the currently selected object.
          </Typography>
          <Typography paragraph>
            In your code, call the <code>{symbols.define}</code> to describe
            what your object does.
          </Typography>
          <Typography>
            Your code runs sandboxed, so you only have access to the native{" "}
            {`APIs`} provided by Deck Forge. {"There's"} also security limits.
            If you overflow the stack, exhaust your memory limit, or try to
            stall the CPU, your code will halt.
          </Typography>
        </>
      ),
    },
  },
  logs: {
    component: memo(LogsPanel, isEqual),
    title: "Logs",
    tour: {
      className: "tour-logs",
      content: (
        <>
          <Typography paragraph>
            The logs panel shows compiler and runtime errors, and events as they
            happen in the game runtime.
          </Typography>
          <Typography>
            Hover a <code style={{ color: colors.variable }}>variable</code> or{" "}
            <code style={{ color: colors.primitive }}>value</code> to highlight
            duplicates across the log. Click a variable name to view its
            content.
          </Typography>
        </>
      ),
    },
  },
  events: {
    component: memo(EventsPanel, isEqual),
    title: "Events",
    tour: {
      className: "tour-events",
      content: (
        <>
          <Typography paragraph>
            Events are <StateReducer>state reducers</StateReducer> that
            represent reusable game mechanics.
          </Typography>
          <Typography paragraph>
            The built-in game runtime will call predefined events at the right
            time. But you can also invoke events from your own code, whether its
            an event invoking another event, or a card invoking an event.
          </Typography>
          <Typography>Right click to add, remove or rename events.</Typography>
        </>
      ),
    },
  },
  reducers: {
    component: memo(ReducersPanel, isEqual),
    title: "Reducers",
    tour: {
      className: "tour-reducers",
      content: (
        <>
          <Typography paragraph>
            Reducers are <StateReducer /> functions that run each time any event
            is invoked.
          </Typography>

          <Typography paragraph>
            Reducers are applied in the order they are listed. Drag and drop to
            re-order reducers.
          </Typography>

          <Typography>
            Right click to add, remove or rename reducers.
          </Typography>
        </>
      ),
    },
  },
  cardProperties: {
    component: memo(CardPropertiesPanel, isEqual),
    title: "Card Properties",
    tour: {
      className: "tour-card-properties",
      content: (
        <>
          <Typography paragraph>
            Card properties define what state exists on all cards. Each property
            has a name, type and default value.
          </Typography>
          <Typography>
            Right click to add, remove or rename properties.
          </Typography>
        </>
      ),
    },
  },
  playerProperties: {
    component: memo(PlayerPropertiesPanel, isEqual),
    title: "Player Properties",
    tour: {
      className: "tour-player-properties",
      content: (
        <>
          <Typography paragraph>
            Player properties define what state exists on all players. Each
            property has a name, type and default value.
          </Typography>
          <Typography>
            Right click to add, remove or rename properties.
          </Typography>
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
              A state reducer is a function that takes two parameters: The
              runtime state object, and a payload. The purpose is to use the
              payload to make mutations to the state object. Any mutations made
              will only be applied to the game state once the reducer has
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
