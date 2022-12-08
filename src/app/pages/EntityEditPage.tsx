import { useRouteParams } from "react-typesafe-routes";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import type { z } from "zod";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";
import { EditableListItem } from "../components/EditableListItem";
import { trpc } from "../trpc";
import type { ModalProps } from "../../lib/useModal";
import { useModal } from "../../lib/useModal";
import { useForm } from "../hooks/useForm";
import {
  propertyMutationPayloadType,
  propertyTypeType,
} from "../../api/services/entity/types";
import { Select } from "../controls/Select";
import { DeleteDialog } from "../dialogs/DeleteDialog";
import { useToastMutation } from "../hooks/useToastMutation";

export default function EntityEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { entityId } = useRouteParams(
    router.build().game({ gameId }).entity().edit
  );
  const properties = trpc.entity.properties.useQuery({ gameId, entityId });
  const propertyEntries = properties.data
    ? Object.entries(properties.data)
    : [];

  const createProperty = useToastMutation(trpc.entity.createProperty);
  const updateProperty = useToastMutation(trpc.entity.updateProperty);
  const deleteProperty = useToastMutation(trpc.entity.deleteProperty);
  const showPropertyDialog = useModal(PropertyFormDialog);
  const confirmDelete = useModal(DeleteDialog);

  return (
    <Page>
      <Header>
        Game: {gameId}, Entity: {entityId}
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Properties">
          {propertyEntries.map(([name, property]) => (
            <EditableListItem
              aria-label={name}
              key={property.propertyId}
              onEdit={() =>
                showPropertyDialog({ name, ...property }).then(
                  (changes) =>
                    changes &&
                    updateProperty.mutate({ ...property, ...changes })
                )
              }
              onDelete={() =>
                confirmDelete({
                  subject: "property",
                  name: name,
                }).then(
                  (confirmed) =>
                    confirmed && deleteProperty.mutate(property.propertyId)
                )
              }
            >
              <ListItemText primary={name} secondary={property.type} />
            </EditableListItem>
          ))}
          {propertyEntries.length === 0 && (
            <Typography align="center">
              {"This entity contains no properties yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button
        variant="contained"
        onClick={() =>
          showPropertyDialog().then(
            (payload) =>
              payload && createProperty.mutate({ gameId, entityId, ...payload })
          )
        }
      >
        Create new property
      </Button>
    </Page>
  );
}

const propertyFormDialogSchema = propertyMutationPayloadType.pick({
  name: true,
  type: true,
});

type PropertyFormDialogProps = ModalProps<
  z.infer<typeof propertyFormDialogSchema> | undefined,
  z.infer<typeof propertyFormDialogSchema> | void
>;

function PropertyFormDialog({
  open,
  resolve,
  input: editedProperty,
}: PropertyFormDialogProps) {
  const form = useForm(propertyFormDialogSchema, {
    defaultValues: editedProperty ?? { type: "number" },
  });
  const submit = form.handleSubmit(resolve);
  const cancel = () => resolve(undefined);
  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <form name="create-property" onSubmit={submit}>
        <DialogTitle>
          {editedProperty ? "Edit property" : "Create new property"}
        </DialogTitle>
        <DialogContent>
          <TextField {...form.register("name")} size="small" label="Name" />
          <Select
            {...form.register("type")}
            label="Type"
            options={propertyTypeType._def.values}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
