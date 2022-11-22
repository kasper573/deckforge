import Stack from "@mui/material/Stack";
import { Header } from "../../../../../../components/Header";
import { CodeEditor } from "../../../../../../components/CodeEditor";
import { PropertyEditor } from "../../../../../../components/PropertyEditor";

export default function CardEditPage() {
  return (
    <>
      <Header>CardEditPage</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <PropertyEditor />
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </>
  );
}
