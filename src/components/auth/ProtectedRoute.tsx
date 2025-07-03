import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('protectedRoute.loginRequired')}</h2>
          <p className="text-muted-foreground">{t('protectedRoute.accessRequired')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}