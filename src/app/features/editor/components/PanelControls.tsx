import type { ReactNode } from "react";
import { useContext, useMemo } from "react";
import {
  getNodeAtPath,
  MosaicContext,
  MosaicWindowContext,
} from "react-mosaic-component";
import IconButton from "@mui/material/IconButton";
import { Close } from "../../../components/icons";
import type { PanelLayout } from "../types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";

export function PanelControls({ children }: { children?: ReactNode }) {
  return (
    <div>
      {children}
      <ClosePanelButton />
    </div>
  );
}

function ClosePanelButton() {
  const { setPanelVisibility } = useActions(editorActions);
  const id = usePanelId();

  return (
    <IconButton
      size="small"
      onClick={() => setPanelVisibility({ id, visible: false })}
    >
      <Close />
    </IconButton>
  );
}

export function usePanelId() {
  const {
    mosaicActions: { getRoot },
  } = useContext(MosaicContext);
  const {
    mosaicWindowActions: { getPath },
  } = useContext(MosaicWindowContext);

  const root = getRoot() as PanelLayout;
  const path = getPath();
  return useMemo(() => {
    const node = getNodeAtPath(root, path);
    const id = typeof node === "string" ? node : undefined;
    if (!id) {
      throw new Error("Could not find panel id");
    }
    return id;
  }, [root, path]);
}
