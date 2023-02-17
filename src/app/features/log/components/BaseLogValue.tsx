import { styled } from "@mui/material/styles";
import type { ComponentProps, ReactNode } from "react";
import classNames from "classnames";
import { useContext } from "react";
import { joinNodes } from "../../../../lib/joinNodes";
import { colors } from "../colors";
import { isPrimitive } from "../../../../lib/ts-extensions/isPrimitive";
import type { LogIdentifier } from "../types";
import { LogContext } from "../LogContext";
import classes from "./BaseLogValue.module.css";

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
  const { highlighter } = useContext(LogContext);
  const { id, show, hide } = highlighter.useHighlight(value, highlight);
  return (
    <StyledValue
      {...props}
      style={{ ...props.style, color }}
      highlightSelector={highlighter.selector(id)}
      onMouseOver={show}
      onMouseOut={hide}
      className={classNames(props.className, punctuationClasses(text))}
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

const StyledValue = styled("span")<{
  highlightSelector?: string;
  isPunctuation?: boolean;
}>((p) => {
  let style = {
    borderRadius: p.theme.shape.borderRadius,
    transition: p.theme.transitions.create("background-color", {
      duration: p.theme.transitions.duration.shortest,
      easing: p.theme.transitions.easing.easeOut,
    }),
  };

  if (p.highlightSelector) {
    style = {
      ...style,
      [p.highlightSelector]: {
        backgroundColor: colors.highlight,
      },
    };
  }
  return style;
});

const punctuation: unknown[] = [",", ";", ":", ".", "!", "?", " "];
function punctuationClasses(value: unknown) {
  const str = String(value);
  const start = punctuation.includes(str[0]);
  const end = punctuation.includes(str[str.length - 1]);
  const none = !start && !end;
  return {
    [classes["log-value"]]: true,
    [classes["pt-start"]]: start,
    [classes["pt-end"]]: end,
    [classes["pt-none"]]: none,
  };
}
