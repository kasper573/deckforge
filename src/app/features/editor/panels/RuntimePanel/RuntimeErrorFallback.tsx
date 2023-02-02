import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { FallbackProps } from "../../../../ErrorBoundary";
import { PanelEmptyState } from "../../components/PanelEmptyState";

export function RuntimeErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <PanelEmptyState>
      <Typography variant="h5">Runtime error</Typography>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </PanelEmptyState>
  );
}
