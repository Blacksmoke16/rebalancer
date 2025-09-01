import { Alert, Button, Stack } from "@mantine/core";
import { Component, ReactNode } from "react";
import commonClasses from "../styles/common.module.css";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Form error caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          color="red"
          title="Form Error"
          withCloseButton
          onClose={this.handleReset}
        >
          <Stack gap="sm">
            <div>
              There was an error with the form. Please try again or refresh the
              page.
            </div>
            {this.state.error && import.meta.env.DEV && (
              <div className={commonClasses.errorDetails}>
                {this.state.error.message}
              </div>
            )}
            <Button size="sm" onClick={this.handleReset}>
              Reset Form
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}
