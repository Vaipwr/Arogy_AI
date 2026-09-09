import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-12 max-w-xl">
          <Card className="p-8 text-center bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              We encountered an issue while loading this section. You can return to the dashboard or try again.
            </p>
            <div className="flex items-center justify-center gap-3">
              {this.props.onReset && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    this.props.onReset?.();
                  }}
                  className="rounded-xl border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <Button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
