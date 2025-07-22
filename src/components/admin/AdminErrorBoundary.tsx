
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('=== AdminErrorBoundary - Error caught ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================================');
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('=== AdminErrorBoundary - Component Info ===');
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('==========================================');
    
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Administratoriaus panelės klaida
              </CardTitle>
              <CardDescription>
                Įvyko klaida kraunant administratoriaus panelę
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <strong>Klaida:</strong> {this.state.error?.message || 'Nežinoma klaida'}
                </div>
                {this.state.error?.name && (
                  <div>
                    <strong>Tipas:</strong> {this.state.error.name}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Techninė informacija</summary>
                  <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                    {this.state.error?.stack || 'Stack trace neprieinamas'}
                  </pre>
                </details>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    console.log('AdminErrorBoundary: Clearing error state');
                    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Bandyti dar kartą
                </Button>
                <Button 
                  onClick={() => {
                    console.log('AdminErrorBoundary: Reloading page');
                    window.location.reload();
                  }}
                  size="sm"
                >
                  Perkrauti puslapį
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
