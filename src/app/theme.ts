import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme as createMuiTheme } from "@mui/material/styles";

export function createTheme() {
  return createMuiTheme({
    palette: {
      mode: "dark",
    },
    components: {
      MuiDialogContent: {
        styleOverrides: {
          root: {
            overflowY: "visible",
            // ~300 is roughly the total of app header/footer + dialog title/actions.
            // Makes sure dialog doesn't cover the app header.
            maxHeight: "calc(100vh - 300px)",
          },
        },
      },
    },
  });
}
