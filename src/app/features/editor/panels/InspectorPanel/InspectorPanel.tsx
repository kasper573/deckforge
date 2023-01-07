import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import type { CardId } from "../../../../../api/services/game/types";
import type { EditorObjectId } from "../../types";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { Panel } from "../../components/Panel";
import { PanelEmptyState } from "../../components/PanelEmptyState";
import type { PanelProps } from "../definition";
import { panelsDefinition } from "../definition";
import { PanelTitle } from "../../components/PanelTitle";
import { PropertyDefaultsEditor } from "./PropertyValueEditor";

export function InspectorPanel({ title, ...props }: PanelProps) {
  const selectedObjectId = useSelector(selectors.selectedObject);
  const id = useSelector(selectors.selectedObject);
  const breadcrumbs = useSelector(selectors.selectedObjectBreadcrumbs);
  return (
    <Panel
      title={
        <PanelTitle
          name={title}
          objectType={id?.type}
          breadcrumbs={breadcrumbs}
        />
      }
      {...props}
    >
      {selectedObjectId ? (
        <ObjectInspector id={selectedObjectId} />
      ) : (
        <PanelEmptyState>
          Select an object to edit its properties
        </PanelEmptyState>
      )}
    </Panel>
  );
}

function ObjectInspector({ id }: { id: EditorObjectId }) {
  switch (id.type) {
    case "card":
      return <CardInspector cardId={id.cardId} />;
  }
  return (
    <PanelEmptyState>
      The selected object has nothing to inspect
    </PanelEmptyState>
  );
}

function CardInspector({ cardId }: { cardId: CardId }) {
  const card = useSelector(selectors.card(cardId));
  const properties = useSelector(selectors.propertiesFor("card"));
  const { updateCard } = useActions(editorActions);
  if (properties.length === 0) {
    return (
      <PanelEmptyState>
        After adding properties in the {panelsDefinition.cardProperties.title}{" "}
        panel you will be able to edit their default values per card here.
      </PanelEmptyState>
    );
  }
  return (
    <PropertyDefaultsEditor
      properties={properties}
      defaults={card?.propertyDefaults ?? {}}
      onChange={(propertyDefaults) => updateCard({ cardId, propertyDefaults })}
    />
  );
}
