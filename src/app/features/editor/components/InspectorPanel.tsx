import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import type {
  CardId,
  PropertyId,
  PropertyType,
} from "../../../../api/services/game/types";
import type { EditorObjectId } from "../types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { propertyValueType } from "../../../../api/services/game/types";
import { Select } from "../../../controls/Select";
import { PropertiesEditor } from "./PropertyEditor";

export function InspectorPanel() {
  const selectedObjectId = useSelector(selectors.selectedObject);
  return (
    <Paper sx={{ gridArea: "inspector" }}>
      {selectedObjectId && <ObjectInspector id={selectedObjectId} />}
    </Paper>
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
    <Typography color="grey">
      The selected object has nothing to inspect
    </Typography>
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
