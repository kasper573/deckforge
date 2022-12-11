import Paper from "@mui/material/Paper";
import { useSelector } from "../../store";
import { selectors } from "../../features/editor/editorState";

export function CodePanel() {
  const selectedObject = useSelector(selectors.selectedObject);
  return (
    <Paper sx={{ gridArea: "code" }}>
      <pre>{JSON.stringify(selectedObject, null, 2)}</pre>
    </Paper>
  );
}
