import type { ComponentProps } from "react";
import type SvgIcon from "@mui/material/SvgIcon";
import KeyboardTab from "@mui/icons-material/KeyboardTab";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import Collections from "@mui/icons-material/Collections";
import CropPortrait from "@mui/icons-material/CropPortrait";
import Link from "@mui/icons-material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { EditorObjectId } from "../types";

export function ObjectIcon({
  type,
  ...props
}: ComponentProps<typeof SvgIcon> & { type: EditorObjectId["type"] }) {
  const Component = iconComponents[type];
  return (
    <Tooltip title={type}>
      <Component {...props} />
    </Tooltip>
  );
}

const iconComponents: Record<EditorObjectId["type"], typeof SvgIcon> = {
  action: KeyboardTab,
  reaction: KeyboardReturn,
  deck: Collections,
  card: CropPortrait,
  property: Link,
};
