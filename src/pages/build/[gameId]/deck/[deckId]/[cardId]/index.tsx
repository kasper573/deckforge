import Stack from "@mui/material/Stack";
import { Header } from "../../../../../../components/Header";
import { CodeEditor } from "../../../../../../components/CodeEditor";
import { PropertyEditor } from "../../../../../../components/PropertyEditor";
import { SideMenu } from "../../../../../../components/SideMenu";

export default function CardEditPage() {
  return (
    <>
      <Header>CardEditPage</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <PropertyEditor />
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </>
  );
}
