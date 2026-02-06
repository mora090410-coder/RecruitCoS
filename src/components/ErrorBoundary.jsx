import React from 'react';
import { trackAppError } from '../lib/analytics';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        trackAppError('ErrorBoundary', error, { component_stack: errorInfo?.componentStack || null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We've encountered an unexpected issue. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full"
                        >
                            Refresh Page
                        </button>
                        {import.meta.env.DEV && (
                            <details className="mt-4 text-left text-xs text-gray-400 overflow-auto max-h-48">
                                <summary>Error Details</summary>
                                <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
