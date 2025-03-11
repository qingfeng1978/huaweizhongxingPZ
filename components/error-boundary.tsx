'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件中的JavaScript错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新状态，下次渲染时显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 您可以将错误记录到错误报告服务
    console.error('组件错误', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 自定义降级UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认降级UI
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTitle className="text-lg font-semibold">组件加载失败</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              应用程序的这一部分发生错误。我们已记录此问题并将尽快修复。
            </p>
            {this.state.error && (
              <p className="text-sm mb-2">
                错误: {this.state.error.toString()}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={this.handleReset}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

/**
 * 用于包装特定组件的错误边界HOC
 * @param Component 要包装的组件
 * @param fallback 可选的降级UI
 * @returns 包装后的组件
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  return WrappedComponent;
} 