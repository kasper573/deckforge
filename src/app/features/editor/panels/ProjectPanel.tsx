import { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import type { MosaicBranch } from "react-mosaic-component";
import Stack from "@mui/material/Stack";
import { DeckTree } from "../components/DeckTree";
import { EventTree } from "../components/EventTree";
import { PropertyTree } from "../components/PropertyTree";
import { Panel } from "../components/Panel";

const tabs = [
  { label: "Decks", content: <DeckTree /> },
  { label: "Events", content: <EventTree /> },
  { label: "Properties", content: <PropertyTree /> },
];

export function ProjectPanel({ path }: { path: MosaicBranch[] }) {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Panel sx={{ py: 2 }} title="Project" path={path}>
      <Stack direction="column" sx={{ flex: 1 }}>
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
      </Stack>
    </Panel>
  );
}
