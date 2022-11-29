import { styled } from "@mui/material/styles";
import { Page } from "../layout/Page";
import { LoadingIndicator } from "../components/LoadingIndicator";

export function LoadingPage() {
  return (
    <Page sx={{ position: "relative" }}>
      <Center>
        <LoadingIndicator size={128} />
      </Center>
    </Page>
  );
}

const Center = styled("div")`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
