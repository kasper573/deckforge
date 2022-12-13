import MenuItem from "@mui/material/MenuItem";
import { Fragment } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { Tree, TreeItem } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptRename } from "../hooks";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import type { PanelProps } from "./definition";

export function PropertiesPanel(props: PanelProps) {
  const entities = useSelector(selectors.entities);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const { createProperty, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  return (
    <Panel title="Properties" {...props}>
      {entities.map((entity, index) => (
        <Fragment key={index}>
          <Typography>{entity.name}</Typography>
          <Tree selected={selectedObjectId} onSelectedChanged={selectObject}>
            {entity.properties.map((property, index) => (
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
          <Button onClick={() => createProperty({ entityId: entity.entityId })}>
            New property
          </Button>
        </Fragment>
      ))}
      {entities.length === 0 && (
        <PanelEmptyState>This game has no entities</PanelEmptyState>
      )}
    </Panel>
  );
}
