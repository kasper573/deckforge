import MenuItem from "@mui/material/MenuItem";
import type { ReactNode } from "react";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { ZodType } from "zod";
import { ZodObject } from "zod";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "../store";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import type { EntityId, Property } from "../../../../api/services/game/types";
import type { EditorObjectId } from "../types";
import { useMenu } from "../../../hooks/useMenu";
import { HoverListItem } from "../../../components/HoverListItem";
import { PropertyEditor } from "../../../controls/PropertyEditor";
import { defined } from "../../../../lib/ts-extensions/defined";
import type { RuntimeDefinition } from "../../compiler/types";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { usePromptCreate, usePromptRename } from "../hooks/usePromptCrud";
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
  properties: Array<Property & { objectId: EditorObjectId }>;
}) {
  const runtimeDef = useSelector(selectors.builtinDefinition);
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
          <PropertyListItem
            key={index}
            isEditable={isPropertyEditable(property, runtimeDef)}
            {...property}
          />
        ))}
      </List>
      {properties.length === 0 && (
        <PanelEmptyState>{emptyMessage}</PanelEmptyState>
      )}
    </Panel>
  );
}

function PropertyListItem({
  isEditable,
  ...property
}: Property & { objectId: EditorObjectId; isEditable: boolean }) {
  const { updateProperty } = useActions(editorActions);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();

  const openContextMenu = useMenu(
    defined([
      isEditable && (
        <MenuItem onClick={() => promptRename(property)}>Rename</MenuItem>
      ),
      isEditable && (
        <MenuItem onClick={() => confirmDelete(property)}>Delete</MenuItem>
      ),
    ])
  );

  return (
    <HoverListItem sx={{ py: 0 }} onContextMenu={openContextMenu}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ width: "100%", height: 34 }}
      >
        <Box
          sx={{ flex: 1, overflow: "hidden" }}
          onDoubleClick={isEditable ? () => promptRename(property) : undefined}
        >
          <Typography noWrap>{property.name}</Typography>
        </Box>
        <div>
          <Tooltip
            title={
              isEditable
                ? undefined
                : "This is a required property and may not be edited"
            }
          >
            <div>
              <PropertyEditor
                disabled={!isEditable}
                property={property}
                onChange={updateProperty}
                title={`Edit type of property "${property.name}"`}
              />
            </div>
          </Tooltip>
        </div>
      </Stack>
    </HoverListItem>
  );
}

function isPropertyEditable(
  property: Property,
  runtimeDef?: RuntimeDefinition
): boolean {
  if (!runtimeDef) {
    return false;
  }
  switch (property.entityId) {
    case "card":
      return !isPropertyInType(property, runtimeDef.card.shape.properties);
    case "player":
      return !isPropertyInType(property, runtimeDef.player.shape.properties);
  }
}

function isPropertyInType(property: Property, type: ZodType) {
  return (
    type instanceof ZodObject && Object.keys(type.shape).includes(property.name)
  );
}
