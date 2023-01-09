import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { ReactNode } from "react";
import type { ModalProps } from "../../lib/useModal";

export type ToastProps = ModalProps<
  void,
  { variant?: AlertColor; content: ReactNode }
>;

export function Toast({
  open,
  resolve,
  input: { variant = "success", content },
}: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClick={() => resolve()}
      onClose={(e, reason) => {
        if (reason === "timeout") {
          resolve();
        }
      }}
    >
      <Alert severity={variant}>{content}</Alert>
    </Snackbar>
  );
}
