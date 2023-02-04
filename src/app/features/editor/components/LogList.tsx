import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useMemo } from "react";
import uniqolor from "uniqolor";
import Rand from "rand-seed";
import Box from "@mui/material/Box";
import { isEqual } from "lodash";
import { InspectorDialog } from "../../../dialogs/InspectorDialog";
import { isLogIdentifier } from "../types";
import type { LogEntry } from "../types";
import { createModalId, useModal } from "../../../../lib/useModal";

export function LogList({ entries = [] }: { entries?: LogEntry[] }) {
  const collapsed = useMemo(() => collapsedLogEntries(entries), [entries]);
  return (
    <Box sx={{ p: 1 }}>
      {collapsed.map(({ entry, count }) => (
        <LogListItem key={entry.id} entry={entry} count={count} />
      ))}
    </Box>
  );
}

export function LogListItem({
  entry,
  count,
}: {
  entry: LogEntry;
  count: number;
}) {
  return (
    <div>
      {entry.content.map((value, index) => (
        <LogValue key={index} value={value} />
      ))}
      {count > 1 && <Highlighted>x{count}</Highlighted>}
    </div>
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
      if (value instanceof LogSpreadError) {
        return (
          <>
            {value.parts.map((part, index) => (
              <LogValue key={index} value={part} />
            ))}
          </>
        );
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

export class LogSpreadError {
  public readonly parts: unknown[];
  constructor(...parts: unknown[]) {
    this.parts = parts;
  }
  toString() {
    return this.parts.join(" ");
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
  &:not(:first-of-type) {
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

function collapsedLogEntries(entries: LogEntry[]) {
  const identical: Array<{ entry: LogEntry; count: number }> = [];
  for (const entry of entries) {
    const prev = identical[identical.length - 1];
    if (prev && isEqual(prev.entry.content, entry.content)) {
      prev.count++;
    } else {
      identical.push({ entry, count: 1 });
    }
  }
  return identical;
}
