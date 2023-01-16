import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { ComponentType, MouseEvent, ReactNode } from "react";
import { cloneElement, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import { createEventBus } from "../../../../../lib/createEventBus";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { useModal } from "../../../../../lib/useModal";
import { AlertDialog } from "../../../../dialogs/AlertDialog";
import { ConfirmDialog } from "../../../../dialogs/ConfirmDialog";
import { createJSONFile, loadFile, saveFile } from "../../../../../lib/fileIO";
import type { GameDefinition } from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import { MenuFor } from "../../../../components/MenuFor";
import { concatFunctions } from "../../../../../lib/ts-extensions/concatFunctions";
import { Menu as MenuIcon } from "../../../../components/icons";
import { PanelVisibilityMenu } from "./PanelVisibilityMenu";

export function EditorMenu() {
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const game = useSelector(selectors.game);
  const { overwriteGameDefinition } = useActions(editorActions);
  const alert = useModal(AlertDialog);
  const confirm = useModal(ConfirmDialog);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const close = () => setAnchorEl(undefined);

  function exportGameDefinition() {
    if (game) {
      saveFile(createJSONFile(game.definition, game.name + ".json"));
    }
  }

  async function importGameDefinition() {
    const file = await loadFile({ accept: "application/json" });
    if (!file) {
      return;
    }

    let newDefinition: GameDefinition;
    try {
      newDefinition = gameDefinitionType.parse(JSON.parse(await file.text()));
    } catch (e) {
      alert({ title: "Invalid game definition", content: String(e) });
      return;
    }

    const shouldOverwrite = await confirm({
      title: "Overwrite game definition?",
      content:
        "The current game definition will be lost forever. Are you sure you want to continue?",
    });

    if (shouldOverwrite) {
      overwriteGameDefinition(newDefinition);
    }
  }

  const Option: ComponentType<{
    children?: ReactNode;
    onClick?: (e: MouseEvent) => unknown;
  }> = isSmallDevice ? MenuItem : Button;

  const options = [
    <MenuFor trigger={({ open }) => <Option onClick={open}>File</Option>}>
      <MenuItem onClick={concatFunctions(close, exportGameDefinition)}>
        Export game
      </MenuItem>
      <MenuItem onClick={concatFunctions(close, importGameDefinition)}>
        Import game
      </MenuItem>
    </MenuFor>,
    <PanelVisibilityMenu
      onClose={close}
      trigger={({ open }) => <Option onClick={open}>Panels</Option>}
    />,
    <Option onClick={concatFunctions(close, helpEvent.emit)}>Help</Option>,
  ];

  const optionElements = options.map((option, i) =>
    cloneElement(option, { key: i })
  );

  if (isSmallDevice) {
    return (
      <>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={close}>
          {optionElements}
        </Menu>
      </>
    );
  }

  return <>{optionElements}</>;
}

export const helpEvent = createEventBus();
