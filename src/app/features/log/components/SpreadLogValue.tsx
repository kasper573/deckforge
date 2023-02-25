import type { LogValue } from "../types";
import { DynamicLogValue } from "./DynamicLogValue";

export function SpreadLogValue({ parts }: { parts: LogValue[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <DynamicLogValue key={index} value={part} />
      ))}
    </>
  );
}
