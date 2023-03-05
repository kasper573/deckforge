import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { ObjectInspector } from "react-inspector";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import type { ModalProps } from "../../lib/useModal";
import { Copy } from "../components/icons";

export interface InspectorDialogProps extends ModalProps {
  title?: ReactNode;
  value: unknown;
  closeLabel?: ReactNode;
  expandLevel?: number;
}

export function InspectorDialog({
  state,
  title = "Inspector",
  value,
  closeLabel = "Close",
  expandLevel = 3,
  resolve,
}: InspectorDialogProps) {
  const close = () => resolve();

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  }

  return (
    <Dialog
      disableRestoreFocus
      fullWidth
      open={state.type === "pending"}
      onClose={close}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <span>{title}</span>
          <Tooltip title="Copy to clipboard">
            <IconButton edge="end" onClick={copyToClipboard}>
              <Copy />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <ObjectInspector
          data={value}
          theme="chromeDark"
          expandLevel={expandLevel}
        />
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" autoFocus onClick={close}>
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
