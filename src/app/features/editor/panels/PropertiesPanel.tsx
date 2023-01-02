import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSelector } from "../store";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptCreate, usePromptRename } from "../hooks";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import type { EntityId, Property } from "../../../../api/services/game/types";
import type { EditorObjectId } from "../types";
import { useMenu } from "../../../hooks/useMenu";
import { HoverListItem } from "../../../components/HoverListItem";
import { PropertyEditor } from "../../../controls/PropertyEditor";
import type { PanelProps } from "./definition";

export function CardPropertiesPanel(props: PanelProps) {
  const properties = useSelector(selectors.propertiesFor("card"));
  return (
    <PropertiesPanel
      entityId="card"
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
  const { createProperty } = useActions(editorActions);
  const promptCreate = usePromptCreate();
  const promptCreateProperty = () =>
    promptCreate("property", (name) => createProperty({ name, entityId }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateProperty}>New property</MenuItem>,
  ]);

  return (
    <Panel onContextMenu={openContextMenu} {...props}>
      <List>
        {properties.map((property, index) => (
          <PropertyListItem key={index} {...property} />
        ))}
      </List>
      {properties.length === 0 && (
        <PanelEmptyState>{emptyMessage}</PanelEmptyState>
      )}
    </Panel>
  );
}

function PropertyListItem(property: Property & { objectId: EditorObjectId }) {
  const { updateProperty } = useActions(editorActions);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();

  const openContextMenu = useMenu([
    <MenuItem onClick={() => promptRename(property)}>Rename</MenuItem>,
    <MenuItem onClick={() => confirmDelete(property)}>Delete</MenuItem>,
  ]);

  return (
    <HoverListItem sx={{ py: 0 }} onContextMenu={openContextMenu}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography noWrap>{property.name}</Typography>
        </Box>
        <div>
          <PropertyEditor
            property={property}
            onChange={updateProperty}
            title={`Edit type of property "${property.name}"`}
          />
        </div>
      </Stack>
    </HoverListItem>
  );
}
