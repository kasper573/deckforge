import { Page } from "../layout/Page";
import { Center } from "../components/Center";

export function NotPermittedPage() {
  return (
    <Page>
      <Center>
        You do not have the required permissions to access this page
      </Center>
    </Page>
  );
}
