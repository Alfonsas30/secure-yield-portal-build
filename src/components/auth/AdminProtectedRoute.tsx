
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, error } = useAdminRole();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout protection (5 seconds)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || adminLoading) {
        console.log('AdminProtectedRoute: Timeout reached after 5 seconds');
        setTimeoutReached(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [authLoading, adminLoading]);

  // Reset timeout when loading completes
  useEffect(() => {
    if (!authLoading && !adminLoading) {
      setTimeoutReached(false);
    }
  }, [authLoading, adminLoading]);

  // Show timeout error
  if (timeoutReached) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Laukimo limitas viršytas
            </CardTitle>
            <CardDescription>
              Sistemos atsakymas užtruko per ilgai
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Patikrinimas užtruko ilgiau nei tikėtasi. Pabandykite perkrauti puslapį.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Perkrauti
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Grįžti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Tikrinamos administratoriaus teisės...</p>
        </div>
      </div>
    );
  }

  // Show auth required
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reikalingas prisijungimas</CardTitle>
            <CardDescription>
              Norėdami pasiekti administratoriaus panelę, turite prisijungti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>
              Grįžti į pagrindinį puslapį
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Klaida
            </CardTitle>
            <CardDescription>
              Nepavyko patikrinti administratoriaus teisių
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Perkrauti
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Grįžti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Prieiga uždrausta
            </CardTitle>
            <CardDescription>
              Jūs neturite administratoriaus teisių
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
              <p>Vartotojas: {user.email}</p>
              <p>ID: {user.id}</p>
              <p>Admin status: {isAdmin ? 'taip' : 'ne'}</p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Grįžti į pagrindinį puslapį
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('AdminProtectedRoute: Error rendering children:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Renderavimo klaida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Įvyko klaida rodant administratoriaus panelę
            </p>
            <Button onClick={() => window.location.reload()}>
              Perkrauti puslapį
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
