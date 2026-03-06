import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught root error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex h-screen w-full flex-col items-center justify-center p-6 bg-background">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Application Error</h1>
                        <p className="text-muted-foreground">
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        {this.state.error && (
                            <div className="text-left bg-muted p-4 rounded-md overflow-auto max-h-48 text-sm font-mono text-muted-foreground">
                                {this.state.error.message}
                            </div>
                        )}
                        <Button onClick={this.handleReset} size="lg" className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export class WidgetErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Widget error caught:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Alert variant="destructive" className="my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Component Error</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-col gap-2">
                        <p>This widget or section encountered an error and could not be loaded.</p>
                        {this.state.error && (
                            <p className="text-xs font-mono opacity-80 truncate" title={this.state.error.message}>
                                {this.state.error.message}
                            </p>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={this.handleReset}
                            className="w-fit mt-2 bg-background/50 text-foreground border-border hover:bg-background"
                        >
                            <RefreshCcw className="mr-2 h-3 w-3" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}
