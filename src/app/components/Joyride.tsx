import type { TooltipRenderProps, Styles } from "react-joyride";
import ReactJoyride from "react-joyride";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import useTheme from "@mui/material/styles/useTheme";
import type { Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

// eslint-disable-next-line mui-path-imports/mui-path-imports
import { lighten } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Cancel from "@mui/icons-material/Cancel";

/**
 * Material-ui skinned Joyride component
 */
export function Joyride(props: ComponentProps<typeof ReactJoyride>) {
  const theme = useTheme();
  const styles = useMemo(() => createThemedStyles(theme), [theme]);
  return (
    <ReactJoyride tooltipComponent={MuiTooltip} styles={styles} {...props} />
  );
}

function createThemedStyles(theme: Theme): Styles {
  return {
    options: {
      arrowColor: tooltipBackground({ theme }),
      primaryColor: theme.palette.primary.main,
      textColor: theme.palette.text.primary,
    },
  };
}

function MuiTooltip({
  index,
  step,
  isLastStep,
  tooltipProps,
  primaryProps,
  backProps,
  closeProps,
}: TooltipRenderProps) {
  return (
    <TooltipRoot {...tooltipProps}>
      <CardContent>{step.content}</CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        {index > 0 && (
          <Button color="secondary" variant="text" {...backProps}>
            Back
          </Button>
        )}
        <Button color="primary" variant="text" {...primaryProps}>
          {isLastStep ? "Finish" : "Next"}
        </Button>
      </CardActions>
      <IconButton
        {...closeProps}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          transform: "translateX(50%)",
        }}
      >
        <Cancel />
      </IconButton>
    </TooltipRoot>
  );
}

const tooltipBackground = ({ theme }: { theme: Theme }) =>
  lighten(theme.palette.background.paper, 0.1);

const TooltipRoot = styled(Card)`
  && {
    max-width: 500px;
    background: ${tooltipBackground};
  }
`;
