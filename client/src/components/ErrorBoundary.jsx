import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="flex items-center gap-4 mb-6 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-2xl font-bold">Application Error</h1>
            </div>
            
            <p className="text-slate-600 mb-6 font-medium">
              A critical error occurred while rendering this page. The development team has been notified.
            </p>

            <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto text-sm text-red-400 font-mono">
              <p className="font-bold mb-2 text-white">Error Output:</p>
              {this.state.error && this.state.error.toString()}
              
              {this.state.errorInfo && (
                <pre className="mt-4 text-slate-400 text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
