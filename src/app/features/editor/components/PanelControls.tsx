import { useContext } from "react";
import { MosaicContext, MosaicWindowContext } from "react-mosaic-component";
import IconButton from "@mui/material/IconButton";
import { Close } from "../../../components/icons";

export function PanelControls() {
  return (
    <div>
      <ClosePanelButton />
    </div>
  );
}

export function ClosePanelButton() {
  const {
    mosaicActions: { remove },
  } = useContext(MosaicContext);
  const {
    mosaicWindowActions: { getPath },
  } = useContext(MosaicWindowContext);

  return (
    <IconButton size="small" onClick={() => remove(getPath())}>
      <Close />
    </IconButton>
  );
}
