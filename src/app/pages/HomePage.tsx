import { Page } from "../layout/Page";
import { trpc } from "../trpc";
import { Header } from "../layout/Header";

export default function HomePage() {
  const { data } = trpc.foo.useQuery();
  return (
    <Page>
      <Header>HomePage</Header>
      Response from tRPC: {data}
    </Page>
  );
}
