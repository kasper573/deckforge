import Link from "../components/Link";
import { Page } from "../layout/Page";

export default function HomePage() {
  return (
    <Page>
      Home
      <Link to="/build">Build</Link>
    </Page>
  );
}
