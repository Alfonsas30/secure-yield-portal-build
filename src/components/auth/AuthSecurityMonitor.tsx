import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function AuthSecurityMonitor() {
  const { user, session, profile, refreshSession } = useAuth();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkSessionHealth = async () => {
    setChecking(true);
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setSessionValid(false);
        return;
      }

      const isValid = !!(currentSession && 
        currentSession.user && 
        currentSession.access_token &&
        currentSession.expires_at &&
        new Date(currentSession.expires_at * 1000) > new Date());

      setSessionValid(isValid);
      
      console.log('=== SESSION HEALTH CHECK ===');
      console.log('Session exists:', !!currentSession);
      console.log('User exists:', !!currentSession?.user);
      console.log('Token exists:', !!currentSession?.access_token);
      console.log('Expires at:', currentSession?.expires_at ? new Date(currentSession.expires_at * 1000).toISOString() : 'N/A');
      console.log('Is expired:', currentSession?.expires_at ? new Date(currentSession.expires_at * 1000) < new Date() : 'N/A');
      console.log('Overall valid:', isValid);

    } catch (error) {
      console.error('Session health check failed:', error);
      setSessionValid(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSessionHealth();
  }, [session]);

  const handleRefreshSession = async () => {
    const refreshedSession = await refreshSession();
    if (refreshedSession) {
      checkSessionHealth();
    }
  };

  const renderStatus = (condition: boolean | null, label: string) => {
    if (condition === null) return <Badge variant="outline">Checking...</Badge>;
    return condition ? 
      <Badge variant="default" className="text-green-600 border-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        {label}
      </Badge> :
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Missing {label}
      </Badge>;
  };

  const authMismatch = user && profile && session && 
    (user.id !== profile.user_id || session.user.id !== profile.user_id);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Auth Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>User: {renderStatus(!!user, 'User')}</div>
          <div>Session: {renderStatus(sessionValid, 'Session')}</div>
          <div>Profile: {renderStatus(!!profile, 'Profile')}</div>
          <div>Valid Token: {renderStatus(sessionValid, 'Token')}</div>
        </div>
        
        {authMismatch && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            CRITICAL: Auth ID mismatch detected!
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSessionHealth}
            disabled={checking}
            className="text-xs h-7"
          >
            {checking ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Check'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshSession}
            className="text-xs h-7"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>User ID: {user?.id?.slice(0, 8)}...</div>
          <div>Profile ID: {profile?.user_id?.slice(0, 8)}...</div>
          <div>Session ID: {session?.user?.id?.slice(0, 8)}...</div>
          {session?.expires_at && (
            <div>Expires: {new Date(session.expires_at * 1000).toLocaleTimeString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}