import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import { MenuFor } from "../../../../components/MenuFor";
import { panelDefinitionList } from "../../panels/definition";
import { useSelector } from "../../../../store";
import { selectors } from "../../selectors";
import { editorActions } from "../../actions";
import { useActions } from "../../../../../lib/useActions";
import { defaultPanelLayout } from "../../panels/defaultPanelLayout";

export function PanelVisibilityMenu() {
  const visibilities = useSelector(selectors.panelVisibilities);
  const { setPanelVisibility, setPanelLayout } = useActions(editorActions);

  const checkboxItems = panelDefinitionList.map(({ id, title }) => (
    <ListItemButton
      key={id}
      dense
      sx={{ pl: 1 }}
      onClick={() => setPanelVisibility({ id, visible: !visibilities[id] })}
    >
      <Checkbox checked={visibilities[id] ?? false} />
      {title}
    </ListItemButton>
  ));

  return (
    <MenuFor
      dontCloseOnSelect
      trigger={({ open }) => <Button onClick={open}>Panels</Button>}
      MenuListProps={{ sx: { pt: 0 } }}
    >
      {[
        ...checkboxItems,
        <Divider key="divider" />,
        <MenuItem
          key="reset"
          onClick={() => setPanelLayout(defaultPanelLayout)}
          sx={{ mt: 1 }}
        >
          Reset to default layout
        </MenuItem>,
      ]}
    </MenuFor>
  );
}
