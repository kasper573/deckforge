import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import { MenuFor } from "../../../components/MenuFor";
import { panelDefinitionList } from "../panels/definition";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { editorActions } from "../actions";
import { useActions } from "../../../../lib/useActions";

export function PanelVisibilityMenu() {
  const visibilities = useSelector(selectors.panelVisibilities);
  const { setPanelVisibility } = useActions(editorActions);
  return (
    <MenuFor
      autoCloseOnSelect={false}
      trigger={({ open }) => <Button onClick={open}>Panels</Button>}
    >
      {panelDefinitionList.map(({ id, title }) => (
        <ListItem key={id} dense>
          <FormControlLabel
            control={
              <Checkbox
                checked={visibilities[id] ?? false}
                onChange={(e) =>
                  setPanelVisibility({ id, visible: e.target.checked })
                }
              />
            }
            label={title}
          />
        </ListItem>
      ))}
    </MenuFor>
  );
}
