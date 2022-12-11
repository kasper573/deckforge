import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";
import { DeckAndCardTree } from "./DeckAndCardTree";
import { EventTree } from "./EventTree";
import { PropertyTree } from "./PropertyTree";

const tabs = [
  { label: "Decks", content: <DeckAndCardTree /> },
  { label: "Events", content: <EventTree /> },
  { label: "Properties", content: <PropertyTree /> },
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
