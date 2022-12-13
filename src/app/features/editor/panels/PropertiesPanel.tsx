import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { Tree, TreeItem } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptRename } from "../hooks";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import type { EntityId, Property } from "../../../../api/services/game/types";
import type { EditorObjectId } from "../types";
import type { PanelProps } from "./definition";

export function CardPropertiesPanel(props: PanelProps) {
  const properties = useSelector(selectors.propertiesFor("card"));
  return (
    <PropertiesPanel
      entityId="card"
      title="Card properties"
      emptyMessage="This game has no card properties"
      properties={properties}
      {...props}
    />
  );
}

export function PlayerPropertiesPanel(props: PanelProps) {
  const properties = useSelector(selectors.propertiesFor("player"));
  return (
    <PropertiesPanel
      entityId="player"
      title="Player properties"
      emptyMessage="This game has no player properties"
      properties={properties}
      {...props}
    />
  );
}

export function PropertiesPanel({
  entityId,
  properties,
  emptyMessage,
  ...props
}: PanelProps & {
  emptyMessage: ReactNode;
  entityId: EntityId;
  title: string;
  properties: Array<Property & { objectId: EditorObjectId }>;
}) {
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const { createProperty, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  return (
    <Panel {...props}>
      <Tree selected={selectedObjectId} onSelectedChanged={selectObject}>
        {properties.map((property, index) => (
          <TreeItem
            key={index}
            nodeId={property.objectId}
            label={property.name}
            contextMenu={[
              <MenuItem onClick={() => promptRename(property)}>
                Rename
              </MenuItem>,
              <MenuItem onClick={() => confirmDelete(property)}>
                Delete
              </MenuItem>,
            ]}
          />
        ))}
      </Tree>
      {properties.length === 0 && (
        <PanelEmptyState>{emptyMessage}</PanelEmptyState>
      )}
    </Panel>
  );
}
