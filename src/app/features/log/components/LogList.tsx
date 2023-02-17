import { useMemo } from "react";
import Box from "@mui/material/Box";
import { isEqual } from "lodash";
import type { LogEntry } from "../types";
import { LogContext } from "../LogContext";
import { createHighlighter } from "../../../hooks/useHighlighter";
import { BaseLogValue } from "./BaseLogValue";
import { DynamicLogValue } from "./DynamicLogValue";

export function LogList({ entries = [] }: { entries?: LogEntry[] }) {
  const collapsed = useMemo(() => collapsedLogEntries(entries), [entries]);
  const highlighter = useMemo(() => createHighlighter("log-highlight"), []);

  return (
    <LogContext.Provider value={{ highlighter }}>
      <Box sx={{ p: 1 }}>
        {collapsed.map(({ entry, count }) => (
          <LogListItem key={entry.id} entry={entry} count={count} />
        ))}
      </Box>
    </LogContext.Provider>
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
        <DynamicLogValue key={index} value={value} />
      ))}
      {count > 1 && <BaseLogValue value={`x${count}`} colorStringsAsValue />}
    </div>
  );
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
