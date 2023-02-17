import type { ComponentProps } from "react";
import { omit } from "lodash";
import { isPrimitive } from "../../isPrimitive";
import { LogIdentifier, LogSpreadError } from "../../types";
import { BaseLogValue } from "./BaseLogValue";
import { SpreadLogValue } from "./SpreadLogValue";
import { InspectableLogValue } from "./InspectableLogValue";

export function DynamicLogValue(props: ComponentProps<typeof BaseLogValue>) {
  const { value } = props;
  switch (typeof value) {
    case "undefined":
    case "number":
    case "boolean":
      return <BaseLogValue {...props} />;
    case "object":
      if (value === null) {
        return <BaseLogValue {...props} />;
      }
      if (value instanceof LogSpreadError) {
        return <SpreadLogValue parts={value.parts} />;
      }
      if (value instanceof Error) {
        return <DynamicLogValue {...props} value={value.message} />;
      }
      if (value instanceof LogIdentifier) {
        if (value.text && isPrimitive(value.value)) {
          return (
            <SpreadLogValue
              parts={[
                value.text,
                ":",
                LogIdentifier.create(value.value, omit(value, "text")),
              ]}
            />
          );
        }
        return (
          <DynamicLogValue {...{ ...props, ...value }} colorStringsAsValue />
        );
      }
      return <InspectableLogValue text="Object" {...props} />;
    default:
      return <BaseLogValue {...props} />;
  }
}
