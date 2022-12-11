import type { ComponentProps } from "react";
import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MuiTreeItem from "@mui/lab/TreeItem";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { useSelector } from "../../store";
import { editorActions, selectors } from "../../features/editor/editorState";
import type { UseMenuItemsConfig } from "../../hooks/useMenu";
import { useMenu } from "../../hooks/useMenu";
import { useActions } from "../../../lib/useActions";

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
  const { createDeck, createCard } = useActions(editorActions);
  const [openContextMenu, contextMenu] = useMenu([
    <MenuItem onClick={() => createDeck({ name: "New deck" })}>
      New deck
    </MenuItem>,
  ]);

  return (
    <Box onContextMenu={openContextMenu} sx={{ flex: 1 }}>
      <Tree>
        {decks.map((deck) => (
          <TreeItem
            key={deck.objectId}
            nodeId={deck.objectId}
            label={deck.name}
            contextMenu={[
              <MenuItem
                onClick={() =>
                  createCard({
                    deckId: deck.deckId,
                    name: "New card",
                    code: "",
                    propertyDefaults: {},
                  })
                }
              >
                New card
              </MenuItem>,
              <MenuItem>Delete</MenuItem>,
            ]}
          >
            {deck.cards.map((card) => (
              <TreeItem
                key={card.objectId}
                nodeId={card.objectId}
                label={card.name}
                contextMenu={[
                  <MenuItem>Rename</MenuItem>,
                  <MenuItem>Delete</MenuItem>,
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

function Tree(props: ComponentProps<typeof TreeView>) {
  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      {...props}
    />
  );
}

function TreeItem({
  contextMenu = [],
  ...props
}: Omit<ComponentProps<typeof MuiTreeItem>, "contextMenu"> & {
  contextMenu?: UseMenuItemsConfig;
}) {
  const [openContextMenu, menuElement] = useMenu(contextMenu);
  return (
    <>
      <MuiTreeItem {...props} onContextMenu={openContextMenu} />
      {menuElement}
    </>
  );
}
