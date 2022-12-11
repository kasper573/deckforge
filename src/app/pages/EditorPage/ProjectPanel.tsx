import type { ComponentProps } from "react";
import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import { useSelector } from "../../store";
import { selectors } from "../../features/editor/editorState";

const tabs = [
  { label: "Decks", content: <Decks /> },
  { label: "Events", content: <Events /> },
  { label: "Properties", content: <Properties /> },
];

export function ProjectPanel() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Paper sx={{ gridArea: "project" }}>
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
    </Paper>
  );
}

function Decks() {
  const decks = useSelector(selectors.decksAndCards);
  return (
    <Tree>
      {decks.map((deck) => (
        <TreeItem key={deck.objectId} nodeId={deck.objectId} label={deck.name}>
          {deck.cards.map((card) => (
            <TreeItem
              key={card.objectId}
              nodeId={card.objectId}
              label={card.name}
            />
          ))}
        </TreeItem>
      ))}
    </Tree>
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
