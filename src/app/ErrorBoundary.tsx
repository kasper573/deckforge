import * as React from "react";
import { TRPCClientError } from "@trpc/client";
import Typography from "@mui/material/Typography";
import type { ComponentType, ErrorInfo, PropsWithChildren } from "react";
import { useHistory } from "react-router";
import { useEffect } from "react";
import { Page } from "./layout/Page";
import { env } from "./env";
import { Center } from "./components/Center";

/**
 * Display the given error in a safe way. Should never be able to crash the app.
 */
export function PlainErrorFallback({ error }: FallbackProps) {
  const message =
    error instanceof TRPCClientError
      ? error.message
      : "Oops, something went wrong";

  return (
    <>
      <Typography>{message}</Typography>
      {env.showErrorDetails && (
        <Typography component="pre">{error.stack}</Typography>
      )}
    </>
  );
}

/**
 * Displays the error in a pretty UI. If this fails to render it will fall back to the plain version.
 */
export function PrettyErrorFallback(props: FallbackProps) {
  // Error boundary must be reset when navigating
  const { resetErrorBoundary } = props;
  const history = useHistory();
  useEffect(
    () => history.listen(resetErrorBoundary),
    [history, resetErrorBoundary]
  );
  return (
    <>
      <Page>
        <Center>
          <PlainErrorFallback {...props} />
        </Center>
      </Page>
    </>
  );
}

type FallbackProps = { error: Error; resetErrorBoundary: () => void };
type ErrorBoundaryState = { error?: Error };
export class ErrorBoundary extends React.Component<
  PropsWithChildren<{
    fallback: ComponentType<FallbackProps>;
    onError?: (error: Error, info: ErrorInfo) => void;
  }>,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  state: ErrorBoundaryState = {};

  reset = () => {
    this.setState({ error: undefined });
  };

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    const { fallback: Fallback, children } = this.props;
    const { error } = this.state;
    return error ? (
      <Fallback error={error} resetErrorBoundary={this.reset} />
    ) : (
      children
    );
  }
}
