import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CircuLeak React Runtime Exception caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 select-none">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#121620] border border-red-900/60 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-950/80 text-red-400 border border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Interface Recovery Notice
                </h2>
                <p className="text-xs text-slate-400">
                  A client-side render exception occurred.
                </p>
              </div>
            </div>

            <div className="p-3 rounded bg-[#0b0e14] border border-[#212838] text-xs font-mono text-red-300 break-words max-h-36 overflow-y-auto">
              {this.state.error?.message || 'Unexpected application error'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={this.handleReset}
                className="flex-1 justify-center"
              >
                Reload Dashboard
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={this.handleClearSession}
                className="flex-1 justify-center text-slate-300"
              >
                Reset Session
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
