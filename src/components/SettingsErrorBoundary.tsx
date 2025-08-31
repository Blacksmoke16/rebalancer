import { Alert, Button, Stack } from '@mantine/core';
import { Component, ReactNode } from 'react';
import commonClasses from '../styles/common.module.css';

interface Props {
    children: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class SettingsErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Settings error caught:', error, errorInfo);
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
                    title="Settings Error"
                    withCloseButton
                    onClose={this.handleReset}
                >
                    <Stack gap="sm">
                        <div>
                            There was an error loading the settings. Please try refreshing the page or reset to continue.
                        </div>
                        {this.state.error && import.meta.env.DEV && (
                            <div className={commonClasses.errorDetails}>
                                {this.state.error.message}
                            </div>
                        )}
                        <Button size="sm" onClick={this.handleReset}>
                            Reset Settings
                        </Button>
                    </Stack>
                </Alert>
            );
        }

        return this.props.children;
    }
}
