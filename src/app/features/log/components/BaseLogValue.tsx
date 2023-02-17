import { styled } from "@mui/material/styles";
import type { ComponentProps, ReactNode } from "react";
import { createHighlighter } from "../../../hooks/useHighlighter";
import { joinNodes } from "../../../../lib/joinNodes";
import { colors } from "../colors";
import { isPrimitive } from "../../../../lib/ts-extensions/isPrimitive";
import type { LogIdentifier } from "../types";

const highlighter = createHighlighter("data-log-highlight");

export function BaseLogValue({
  value,
  text = String(value),
  colorStringsAsValue,
  color = determineColor(value, text, colorStringsAsValue),
  highlight,
  ...props
}: Partial<LogIdentifier> & { colorStringsAsValue?: boolean } & Omit<
    ComponentProps<typeof StyledValue>,
    "children"
  >) {
  return (
    <StyledValue
      style={{ color }}
      highlightId={value}
      onMouseOver={highlight ? () => highlighter.setId(value) : undefined}
      onMouseOut={highlight ? () => highlighter.setId(undefined) : undefined}
      {...props}
    >
      {formatText(text, value)}
    </StyledValue>
  );
}

function formatText(text: ReactNode, value: unknown): ReactNode {
  if (isPrimitive(value) && text !== value) {
    text = `${text}: ${value}`;
  }
  return typeof text === "string" ? joinNodes(text.split(/\n/), <br />) : text;
}

const determineColor = (
  value: unknown,
  name: ReactNode,
  colorStringValues?: boolean
): string | undefined => {
  if (typeof value === "string") {
    return colorStringValues ? colors.string : undefined;
  }
  if (isPrimitive(value)) {
    return colors.primitive;
  }
  const hasDivergentName = name !== value;
  if (hasDivergentName) {
    return colors.variable;
  }
};

const StyledValue = styled("span")<{ highlightId?: unknown }>((p) => {
  let style = {
    borderRadius: p.theme.shape.borderRadius,
    transition: p.theme.transitions.create("background-color", {
      duration: p.theme.transitions.duration.shortest,
      easing: p.theme.transitions.easing.easeOut,
    }),
    [":not(:first-of-type)"]: {
      marginLeft: 4,
    },
  };
  if (p.highlightId !== undefined) {
    style = {
      ...style,
      [highlighter.selector(p.highlightId)]: {
        backgroundColor: p.theme.palette.secondary.dark,
      },
    };
  }
  return style;
});
