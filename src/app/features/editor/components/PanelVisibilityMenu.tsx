import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ListItem from "@mui/material/ListItem";
import { MenuFor } from "../../../components/MenuFor";
import { panelDefinitionList } from "../panels/definition";

export function PanelVisibilityMenu() {
  return (
    <MenuFor
      autoCloseOnSelect={false}
      trigger={({ open }) => <Button onClick={open}>Panels</Button>}
    >
      {panelDefinitionList.map(({ id, title }) => (
        <ListItem key={id} dense>
          <FormControlLabel control={<Checkbox />} label={title} />
        </ListItem>
      ))}
    </MenuFor>
  );
}
