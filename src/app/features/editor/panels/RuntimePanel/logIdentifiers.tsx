import { cloneDeep } from "lodash";
import Tooltip from "@mui/material/Tooltip";
import { LogIdentifier } from "../../../log/types";
import { ObjectIcon } from "../../components/ObjectIcon";
import { LogIcon } from "../../../log/components/LogIcon";
import { Error } from "../../../../components/icons";
import { colors } from "../../../log/colors";

export const logIdentifiers = {
  event: (
    <LogIcon>
      <ObjectIcon type="event" />
    </LogIcon>
  ),
  reducer: (
    <LogIcon>
      <ObjectIcon type="reducer" />
    </LogIcon>
  ),
  card: (
    <LogIcon>
      <ObjectIcon type="card" />
    </LogIcon>
  ),
  errors: {
    runtime: (
      <LogIcon>
        <Tooltip title="Runtime Error">
          <Error htmlColor={colors.error} />
        </Tooltip>
      </LogIcon>
    ),
    compiler: (
      <LogIcon>
        <Tooltip title="Compiler Error">
          <Error htmlColor={colors.error} />
        </Tooltip>
      </LogIcon>
    ),
  },
  variable: (name: string, state: unknown) =>
    LogIdentifier.create(cloneDeep(state), {
      text: name,
      highlight: true,
    }),
};
