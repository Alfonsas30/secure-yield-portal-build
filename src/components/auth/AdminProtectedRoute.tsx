
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, error } = useAdminRole();
  const navigate = useNavigate();

  console.log('AdminProtectedRoute state:', {
    user: user?.id,
    authLoading,
    adminLoading,
    isAdmin,
    error
  });

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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Prieiga uždrausta</CardTitle>
            <CardDescription>
              Jūs neturite administratoriaus teisių
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-4">
              <p>Vartotojas: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
            <Button onClick={() => navigate('/')}>
              Grįžti į pagrindinį puslapį
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
