// /src/components/common/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error reporting service in production
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
      // Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-4">
              <div className="mx-auto h-24 w-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              نأسف، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
            >
              العودة للصفحة الرئيسية
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left text-xs text-gray-500 dark:text-gray-400">
                <summary className="cursor-pointer">Error Details (Dev Only)</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;