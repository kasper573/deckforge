import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree, TreeItem } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptRename } from "../hooks";

export function DeckTree() {
  const decks = useSelector(selectors.decksAndCards);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const { createDeck, createCard, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);
  const openContextMenu = useMenu([
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
              <MenuItem onClick={() => promptRename(deck)}>Rename</MenuItem>,
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
                  <MenuItem onClick={() => promptRename(card)}>
                    Rename
                  </MenuItem>,
                  <MenuItem onClick={() => confirmDelete(card)}>
                    Delete
                  </MenuItem>,
                ]}
              />
            ))}
          </TreeItem>
        ))}
      </Tree>
    </Box>
  );
}
