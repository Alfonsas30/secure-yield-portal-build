
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
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('Admin Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Error Boundary - Component stack:', errorInfo.componentStack);
    console.error('Admin Error Boundary - Error:', error);
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
              <div className="text-sm text-muted-foreground">
                <strong>Klaida:</strong> {this.state.error?.message || 'Nežinoma klaida'}
              </div>
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="w-full"
              >
                Perkrauti puslapį
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
