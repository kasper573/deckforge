import { styled } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";
import type { ReactNode } from "react";
import { useMemo } from "react";
import uniqolor from "uniqolor";
import List from "@mui/material/List";
import Rand from "rand-seed";
import { InspectorDialog } from "../../../dialogs/InspectorDialog";
import { isLogIdentifier } from "../types";
import type { LogEntry } from "../types";
import { createModalId, useModal } from "../../../../lib/useModal";

export function LogList({ entries = [] }: { entries?: LogEntry[] }) {
  return (
    <List>
      {entries.map((entry) => (
        <LogListItem key={entry.id} entry={entry} />
      ))}
    </List>
  );
}

export function LogListItem({ entry }: { entry: LogEntry }) {
  return (
    <ListItem>
      {entry.content.map((value, index) => (
        <LogValue key={index} value={value} />
      ))}
    </ListItem>
  );
}

export function LogValue({
  value,
  objectName,
  fixedColor,
  deriveColor,
}: {
  value: unknown;
  objectName?: string;
  fixedColor?: string;
  deriveColor?: boolean;
}) {
  const color = useMemo(
    () =>
      fixedColor ??
      (deriveColor ? seededUniqueColor(objectName ?? value) : undefined),
    [objectName, value, fixedColor, deriveColor]
  );

  const props = color ? { style: { color } } : {};

  switch (typeof value) {
    case "undefined":
    case "number":
    case "boolean":
      return <Highlighted {...props}>{value}</Highlighted>;
    case "object":
      if (value === null) {
        return <Highlighted {...props}>null</Highlighted>;
      }
      if (value instanceof Error) {
        return <Normal {...props}>{String(value)}</Normal>;
      }
      if (isLogIdentifier(value)) {
        return (
          <LogValue
            value={value.value}
            objectName={value.name}
            fixedColor={value.color}
            deriveColor
          />
        );
      }
      return <ObjectValue value={value} name={objectName} {...props} />;
    default:
      return <Normal {...props}>{String(value)}</Normal>;
  }
}

function ObjectValue({
  value,
  name = "Object",
}: {
  value: unknown;
  name?: ReactNode;
}) {
  const inspect = useModal(InspectorDialog, sharedInspectorDialogId);
  return <Interaction onClick={() => inspect({ value })}>{name}</Interaction>;
}

// Use a shared ID so each inspectable value doesn't allocate a new dialog
const sharedInspectorDialogId = createModalId();

const Value = styled("span")`
  &:not(:first-child) {
    padding-left: 4px;
  }
`;

const Highlighted = styled(Value)`
  color: ${(p) => p.theme.palette.secondary.main};
`;

const Normal = styled(Value)`
  color: ${(p) => p.theme.palette.text.secondary};
`;

const Interaction = styled(Value)`
  color: ${(p) => p.theme.palette.primary.main};
  cursor: pointer;
`;

function seededUniqueColor(value: unknown) {
  const rng = new Rand(JSON.stringify(value));
  const input = rng.next();
  const { color } = uniqolor(input);
  return color;
}
