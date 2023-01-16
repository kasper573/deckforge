import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";
import { styled } from "@mui/material/styles";

// eslint-disable-next-line mui-path-imports/mui-path-imports
import { Backdrop, Popper, Zoom } from "@mui/material";
import { useEffect, useMemo } from "react";
import useTheme from "@mui/material/styles/useTheme";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import { useElementSelector } from "../hooks/useElementSelector";
import { createFrameClipPath } from "../../lib/clipPath";
import { useElementBounds } from "../hooks/useElementBounds";
import { Close } from "./icons";

export interface TourState {
  step: number;
  active: boolean;
}

export interface TourStep {
  className: string;
  content: ReactNode;
}

export interface TourProps {
  steps: TourStep[];
  state: TourState;
  onChange: (state: TourState) => void;
}

export function Tour({ steps, state, onChange }: TourProps) {
  const theme = useTheme();
  const { step: stepIndex, active } = state;
  const isLastStep = stepIndex === steps.length - 1;
  const step = steps[stepIndex];
  const anchor = useElementSelector(`.${step.className}`);
  const anchorBounds = useElementBounds(anchor);
  const virtualAnchor = anchorBounds && {
    getBoundingClientRect: () => anchorBounds,
  };
  const clipPath = useMemo(
    () => createFrameClipPath(anchorBounds),
    [anchorBounds]
  );

  const close = () => onChange({ ...state, active: false });
  const next = () =>
    onChange({ ...state, step: (stepIndex + 1) % steps.length });
  const back = () => onChange({ ...state, step: Math.max(0, stepIndex - 1) });

  useEffect(() => {
    if (active && anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [anchor, active]);

  return (
    <>
      <TooltipBackdrop style={{ clipPath }} open={active} />
      <Popper
        components={{ Root: TooltipRoot }}
        open={active}
        anchorEl={virtualAnchor}
        placement="auto"
        transition
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, parseInt(theme.spacing(2))] },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Zoom {...TransitionProps}>
            <TooltipCard elevation={4}>
              <Tooltip title="End tour">
                <DockedIconButton onClick={close}>
                  <Close />
                </DockedIconButton>
              </Tooltip>
              <CardContent>{step.content}</CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                {stepIndex > 0 && (
                  <Button color="secondary" variant="text" onClick={back}>
                    Back
                  </Button>
                )}
                <Button
                  color="primary"
                  variant="text"
                  onClick={isLastStep ? close : next}
                >
                  {isLastStep ? "Finish" : "Next"}
                </Button>
              </CardActions>
            </TooltipCard>
          </Zoom>
        )}
      </Popper>
    </>
  );
}

const DockedIconButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

const TooltipCard = styled(Paper)`
  max-width: 500px;
`;

const TooltipRoot = styled("div")`
  z-index: ${({ theme }) => theme.zIndex.drawer - 1};
`;

const TooltipBackdrop = styled(Backdrop)`
  z-index: ${({ theme }) => theme.zIndex.appBar - 1};
`;
