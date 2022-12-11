import Paper from "@mui/material/Paper";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";

export function InspectorPanel() {
  const selectedObjectId = useSelector(selectors.selectedObject);
  return (
    <Paper sx={{ gridArea: "inspector" }}>
      <pre>{JSON.stringify(selectedObjectId, null, 2)}</pre>
    </Paper>
  );
}
