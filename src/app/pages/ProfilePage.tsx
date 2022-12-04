import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Page } from "../layout/Page";
import { useForm } from "../hooks/useForm";
import { updateProfilePayloadType } from "../../api/services/user/types";
import { trpc } from "../trpc";
import { Center } from "../components/Center";
import { Header } from "../layout/Header";
import { ProgressButton } from "../components/ProgressButton";

export default function ProfilePage() {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toast, setToast] = useState<string>();
  const { data: defaultValues } = trpc.user.profile.useQuery();
  const form = useForm(updateProfilePayloadType, { defaultValues });
  const updateProfile = trpc.user.updateProfile.useMutation();
  const { submit, error } = form.useMutation(updateProfile, {
    onSubmit: () => setIsToastOpen(false),
    onSuccess: () => {
      setIsToastOpen(true);
      setToast("Profile updated");
    },
  });

  return (
    <Page>
      <Header>Profile</Header>
      <Center>
        <form name="profile" onSubmit={submit}>
          <Stack direction="column" spacing={2} sx={{ width: 350 }}>
            <TextField {...form.register("email")} size="small" label="Email" />
            <TextField
              {...form.register("password")}
              size="small"
              type="password"
              label="New password"
            />
            <TextField
              {...form.register("passwordConfirm")}
              size="small"
              type="password"
              label="New password (confirm)"
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="error" sx={{ flex: 1 }}>
                {error}
              </Typography>
              <div>
                <ProgressButton
                  isLoading={updateProfile.isLoading}
                  type="submit"
                  variant="contained"
                >
                  Save
                </ProgressButton>
              </div>
            </Stack>
          </Stack>
        </form>
      </Center>
      <Snackbar
        open={isToastOpen}
        autoHideDuration={6000}
        onClose={() => setIsToastOpen(false)}
      >
        <Alert severity="success">{toast}</Alert>
      </Snackbar>
    </Page>
  );
}
