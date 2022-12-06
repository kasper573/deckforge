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
import type { Property } from "@prisma/client";
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
  propertyTypeNameType,
} from "../../api/services/entity/types";
import { Select } from "../controls/Select";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";

export default function EntityEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { entityId } = useRouteParams(
    router.build().game({ gameId }).entity().edit
  );
  const { data: properties } = trpc.entity.listProperties.useQuery({
    filter: { gameId, entityId },
    offset: 0,
    limit: 10,
  });
  const createProperty = trpc.entity.createProperty.useMutation();
  const updateProperty = trpc.entity.updateProperty.useMutation();
  const deleteProperty = trpc.entity.deleteProperty.useMutation();
  const showPropertyDialog = useModal(PropertyFormDialog);
  const confirm = useModal(ConfirmDialog);

  async function openDialogAndMutateProperty(editedProperty?: Property) {
    const formPayload = await showPropertyDialog(editedProperty);
    if (formPayload) {
      if (editedProperty) {
        updateProperty.mutate({ ...editedProperty, ...formPayload });
      } else {
        createProperty.mutate({ gameId, entityId, ...formPayload });
      }
    }
  }

  async function confirmDelete({ propertyId, name }: Property) {
    const shouldDelete = await confirm({
      title: "Delete property",
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteProperty.mutate(propertyId);
    }
  }

  return (
    <Page>
      <Header>
        Game: {gameId}, Entity: {entityId}
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          {properties?.entities.map((property) => (
            <EditableListItem
              key={property.propertyId}
              onEdit={() => openDialogAndMutateProperty(property)}
              onDelete={() => confirmDelete(property)}
            >
              <ListItemText
                primary={property.name}
                secondary={property.typeName}
              />
            </EditableListItem>
          ))}
          {properties?.total === 0 && (
            <Typography align="center">
              {"This entity contains no properties yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button variant="contained" onClick={() => openDialogAndMutateProperty()}>
        Create new property
      </Button>
    </Page>
  );
}

const propertyFormDialogSchema = propertyMutationPayloadType.pick({
  name: true,
  typeName: true,
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
    defaultValues: editedProperty ?? { typeName: "number" },
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
          <Select {...form.register("typeName")}>
            {propertyTypeNameType._def.values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
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
