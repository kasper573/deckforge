import type { ComponentProps, ComponentType } from "react";
import type SvgIcon from "@mui/material/SvgIcon";
import Collections from "@mui/icons-material/Collections";
import CropPortrait from "@mui/icons-material/CropPortrait";
import Link from "@mui/icons-material/Link";
import Tooltip from "@mui/material/Tooltip";
import Reply from "@mui/icons-material/Reply";
import { styled } from "@mui/material/styles";
import { capitalize } from "lodash";
import type { EditorObjectId } from "../types";

export function ObjectIcon({
  type,
  ...props
}: ComponentProps<typeof SvgIcon> & { type: EditorObjectId["type"] }) {
  const Component = iconComponents[type];
  return (
    <Tooltip title={capitalize(type)}>
      <Component {...props} />
    </Tooltip>
  );
}

const EventIcon = styled(Reply)`
  transform: rotate(180deg);
`;

const iconComponents: Record<EditorObjectId["type"], ComponentType> = {
  event: EventIcon,
  reducer: Link,
  deck: Collections,
  card: CropPortrait,
  property: Link,
};
