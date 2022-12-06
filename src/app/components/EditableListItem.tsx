import ListItem from "@mui/material/ListItem";
import type { ComponentProps } from "react";
import IconButton from "@mui/material/IconButton";
import { Delete, Edit } from "./icons";

export interface EditableListItemProps extends ComponentProps<typeof ListItem> {
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EditableListItem({
  readOnly,
  sx,
  onEdit,
  onDelete,
  ...props
}: EditableListItemProps) {
  return (
    <ListItem
      secondaryAction={
        !readOnly && (
          <>
            <IconButton aria-label="edit" onClick={onEdit}>
              <Edit />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={onDelete}>
              <Delete />
            </IconButton>
          </>
        )
      }
      sx={{ opacity: readOnly ? 0.5 : 1, ...sx }}
      {...props}
    />
  );
}
