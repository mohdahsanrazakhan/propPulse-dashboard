"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[UI error]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <p className="text-sm">Something went wrong loading this section.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
