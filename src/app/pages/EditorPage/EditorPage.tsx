import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { ProjectPanel } from "./ProjectPanel";

export default function EditorPage() {
  return (
    <EditorContainer>
      <CodePanel>Code</CodePanel>
      <ProjectPanel />
      <InspectorPanel>Inspector</InspectorPanel>
    </EditorContainer>
  );
}

const EditorContainer = styled("div")`
  display: grid;
  flex: 1;
  grid-gap: 16px;
  margin: 16px;
  grid-template-areas:
    "code code code project"
    "code code code inspector"; ;
`;

const CodePanel = styled(Paper)`
  grid-area: code;
`;

const InspectorPanel = styled(Paper)`
  grid-area: inspector;
`;
