import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { styled } from "@mui/material/styles";
import type { CodeEditorTypeDefs } from "../../../../components/CodeEditor";
import type { ModalProps } from "../../../../../lib/useModal";
import { CodeEditorWithoutTypedefs } from "../../../../components/CodeEditor";

export function ApiReferenceDialog({
  open,
  resolve,
  input: typeDefs,
}: { input: CodeEditorTypeDefs | undefined } & ModalProps) {
  return (
    <Dialog maxWidth={false} open={open} onClose={() => resolve()}>
      <DialogTitle>API Reference</DialogTitle>
      <DialogContent>
        <ContentBounds>
          <Docked>
            <CodeEditorWithoutTypedefs
              value={typeDefs?.trim() ?? ""}
              options={{ readOnly: true, renderValidationDecorations: "off" }}
            />
          </Docked>
        </ContentBounds>
      </DialogContent>
    </Dialog>
  );
}

const ContentBounds = styled("div")`
  min-width: 65vw;
  min-height: 50vh;
  overflow: hidden;
  position: relative;
`;

// Docking used because the parent element of the monaco editor must have a fixed size
const Docked = styled("div")`
  width: 100%;
  height: 100%;
  position: absolute;
`;
