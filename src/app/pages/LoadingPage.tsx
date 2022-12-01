import { Page } from "../layout/Page";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { Center } from "../components/Center";

export function LoadingPage() {
  return (
    <Page sx={{ position: "relative" }}>
      <Center>
        <LoadingIndicator size={128} />
      </Center>
    </Page>
  );
}
