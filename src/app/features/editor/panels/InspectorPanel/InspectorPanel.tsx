import { useSelector } from "../../../../store";
import { selectors } from "../../selectors";
import type {
  CardId,
  PropertyId,
  PropertyType,
} from "../../../../../api/services/game/types";
import type { EditorObjectId } from "../../types";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { propertyValueType } from "../../../../../api/services/game/types";
import { Select } from "../../../../controls/Select";
import { Panel } from "../../components/Panel";
import { PanelEmptyState } from "../../components/PanelEmptyState";
import type { PanelProps } from "../definition";
import { PropertiesEditor } from "./PropertyEditor";

export function InspectorPanel(props: PanelProps) {
  const selectedObjectId = useSelector(selectors.selectedObject);
  return (
    <Panel {...props}>
      {selectedObjectId && <ObjectInspector id={selectedObjectId} />}
    </Panel>
  );
}

function ObjectInspector({ id }: { id: EditorObjectId }) {
  switch (id.type) {
    case "card":
      return <CardInspector cardId={id.cardId} />;
    case "property":
      return <PropertyInspector propertyId={id.propertyId} />;
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
  return (
    <PropertiesEditor
      properties={properties}
      values={card?.propertyDefaults ?? {}}
      onChange={(propertyDefaults) => updateCard({ cardId, propertyDefaults })}
    />
  );
}

function PropertyInspector({ propertyId }: { propertyId: PropertyId }) {
  const property = useSelector(selectors.property(propertyId));
  const { updateProperty } = useActions(editorActions);

  if (!property) {
    return null;
  }
  return (
    <Select
      value={property.type}
      label="Type"
      options={propertyValueType._def.values}
      onChange={(e) =>
        updateProperty({ propertyId, type: e.target.value as PropertyType })
      }
    />
  );
}
