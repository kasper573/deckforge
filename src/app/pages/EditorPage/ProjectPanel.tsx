import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { useSelector } from "../../store";
import type { EditorObjectId } from "../../features/editor/editorState";
import { editorActions, selectors } from "../../features/editor/editorState";
import { useMenu } from "../../hooks/useMenu";
import { useActions } from "../../../lib/useActions";
import { Tree, TreeItem } from "../../components/Tree";
import { useModal } from "../../../lib/useModal";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";

const tabs = [
  { label: "Decks", content: <Decks /> },
  { label: "Events", content: <Events /> },
  { label: "Properties", content: <Properties /> },
];

export function ProjectPanel() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Root>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newTab) => setTabIndex(newTab)}
          aria-label="Project"
        >
          {tabs.map(({ label }, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>
      {tabs[tabIndex].content}
    </Root>
  );
}

const Root = styled(Paper)`
  grid-area: project;
  display: flex;
  flex-direction: column;
`;

function Decks() {
  const decks = useSelector(selectors.decksAndCards);
  const confirmDelete = useConfirmDelete();
  const { createDeck, createCard, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);
  const [openContextMenu, contextMenu] = useMenu([
    <MenuItem onClick={() => createDeck({})}>New deck</MenuItem>,
  ]);

  return (
    <Box onContextMenu={openContextMenu} sx={{ flex: 1 }}>
      <Tree selected={selectedObjectId} onSelectedChanged={selectObject}>
        {decks.map((deck, index) => (
          <TreeItem
            key={index}
            nodeId={deck.objectId}
            label={deck.name}
            contextMenu={[
              <MenuItem onClick={() => createCard({ deckId: deck.deckId })}>
                New card
              </MenuItem>,
              <MenuItem onClick={() => confirmDelete(deck)}>Delete</MenuItem>,
            ]}
          >
            {deck.cards.map((card, index) => (
              <TreeItem
                key={index}
                nodeId={card.objectId}
                label={card.name}
                contextMenu={[
                  <MenuItem>Rename</MenuItem>,
                  <MenuItem onClick={() => confirmDelete(card)}>
                    Delete
                  </MenuItem>,
                ]}
              />
            ))}
          </TreeItem>
        ))}
      </Tree>
      {contextMenu}
    </Box>
  );
}

function Events() {
  return <>Events</>;
}

function Properties() {
  return <>Properties</>;
}

function useConfirmDelete() {
  const confirm = useModal(ConfirmDialog);
  const { deleteObject } = useActions(editorActions);
  return async function confirmDelete({
    objectId,
    name,
  }: {
    objectId: EditorObjectId;
    name: string;
  }) {
    const shouldDelete = await confirm({
      title: `Delete ${objectId.type}`,
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteObject(objectId);
    }
  };
}
