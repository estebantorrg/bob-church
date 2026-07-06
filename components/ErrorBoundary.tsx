import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <img src="/bob/BOB_dumbfounded.gif" alt="B.O.B. dumbfounded" className="w-32 h-32 object-contain mx-auto mb-6 rounded-full" />
            <h1 className="display-font text-3xl text-[#9AA9FF] mb-4">
              B.O.B. Broke Something
            </h1>
            <p className="text-white/70 mb-2 text-lg">
              Something went wrong. B.O.B. is not sure what. Or where. Or why.
            </p>
            <p className="text-white/40 text-sm mb-8 italic">
              He would apologize, but he already forgot what happened.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-[#6C7AE0]/20 hover:bg-[#6C7AE0]/40 border border-[#6C7AE0] text-[#9AA9FF] font-bold rounded-lg uppercase tracking-wider transition-all hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white/70 font-bold rounded-lg uppercase tracking-wider transition-all"
              >
                Reload Page
              </button>
            </div>

            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50 uppercase tracking-widest">
                  Technical Details
                </summary>
                <pre className="mt-2 text-[10px] text-red-400/60 bg-black/40 p-3 rounded overflow-x-auto border border-white/5">
                  {this.state.error.message}
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
