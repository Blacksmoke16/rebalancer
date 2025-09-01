import { Button, Stack, Text, Title } from "@mantine/core";
import { Component, ReactNode } from "react";
import commonClasses from "../styles/common.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack align="center" justify="center" h="100vh" p="xl">
          <Title order={2}>Something went wrong</Title>
          <Text c="dimmed">
            The application encountered an unexpected error.
          </Text>
          {this.state.error && (
            <Text size="sm" c="red" className={commonClasses.errorText}>
              {this.state.error.message}
            </Text>
          )}
          <Button onClick={this.handleReset}>Try Again</Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
