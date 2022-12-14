import type { EditorObjectId } from "./types";

export function PanelTitle({
  name,
  objectType,
  breadcrumbs,
}: {
  name: string;
  objectType?: EditorObjectId["type"];
  breadcrumbs?: string[];
}) {
  if (objectType && breadcrumbs) {
    return (
      <>
        {name} ({objectType}: {breadcrumbs.join(" / ")})
      </>
    );
  }
  return <>{name}</>;
}
