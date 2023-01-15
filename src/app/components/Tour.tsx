import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";
import { styled } from "@mui/material/styles";

// eslint-disable-next-line mui-path-imports/mui-path-imports
import { Backdrop, Popper, Zoom } from "@mui/material";
import { useElementSelector } from "../hooks/useElementSelector";

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

/**
 * Material-ui skinned Joyride component
 */
export function Tour({ steps, state, onChange }: TourProps) {
  const { step: stepIndex, active } = state;
  const isLastStep = stepIndex === steps.length - 1;
  const step = steps[stepIndex];
  const anchor = useElementSelector(`.${step.className}`);

  const close = () => onChange({ ...state, active: false });
  const next = () => onChange({ ...state, step: stepIndex + 1 });
  const back = () => onChange({ ...state, step: stepIndex - 1 });

  return (
    <>
      <TooltipBackdrop open={active} />
      <Popper
        components={{ Root: TooltipRoot }}
        open={active}
        anchorEl={anchor}
        placement="auto"
        transition
      >
        {({ TransitionProps }) => (
          <Zoom {...TransitionProps}>
            <Card>
              <CardContent>{step.content}</CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button color="primary" variant="text" onClick={close}>
                  Close
                </Button>
                {stepIndex > 0 && (
                  <Button color="secondary" variant="text" onClick={back}>
                    Back
                  </Button>
                )}
                <Button color="primary" variant="text" onClick={next}>
                  {isLastStep ? "Finish" : "Next"}
                </Button>
              </CardActions>
            </Card>
          </Zoom>
        )}
      </Popper>
    </>
  );
}

const TooltipRoot = styled("div")`
  max-width: 500px;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
`;

const TooltipBackdrop = styled(Backdrop)`
  z-index: ${({ theme }) => theme.zIndex.drawer};
`;
