import type { ReactNode } from "react";

export interface LogEntry {
  id: string;
  content: LogContent[];
}

export type LogValue = unknown;
export type LogContent = LogValue | LogIdentifier;

export class LogIdentifier {
  constructor(
    public readonly value?: LogValue,
    public readonly text?: ReactNode,
    public readonly color?: string,
    public readonly highlight?: boolean
  ) {}

  static create(
    value: LogValue,
    {
      text,
      color,
      highlight,
    }: Pick<LogIdentifier, "text" | "color" | "highlight"> = {}
  ) {
    return new LogIdentifier(value, text, color, highlight);
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
