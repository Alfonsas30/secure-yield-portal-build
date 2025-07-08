import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminBalanceControl } from '@/components/banking/AdminBalanceControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BarChart, DollarSign, Settings } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';

const Admin = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  console.log('🔧 Admin Component: Render state', {
    user: !!user,
    userId: user?.id,
    email: user?.email,
    session: !!session,
    authLoading,
    adminLoading,
    isAdmin
  });

  // Add debug panel when there are issues
  const showDebugPanel = authLoading || adminLoading || (!authLoading && !adminLoading && !isAdmin);

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Kraunama... (Auth: {authLoading ? 'loading' : 'ready'}, Admin: {adminLoading ? 'loading' : 'ready'})</p>
          {showDebugPanel && (
            <Card className="mt-8 max-w-md bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-sm">🔧 Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-left">
                <p>User: {user ? '✓' : '✗'} ({user?.email})</p>
                <p>Session: {session ? '✓' : '✗'}</p>
                <p>Auth Loading: {authLoading ? '✓' : '✗'}</p>
                <p>Admin Loading: {adminLoading ? '✓' : '✗'}</p>
                <p>Is Admin: {isAdmin ? '✓' : '✗'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Prieiga uždrausta</CardTitle>
              <CardDescription>
                Jūs neturite administratoriaus teisių šiai sistemai pasiekti.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-sm text-yellow-800">🔧 Debug Info</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <p><strong>User:</strong> {user ? '✓' : '✗'} ({user?.email || 'N/A'})</p>
                  <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                  <p><strong>Session:</strong> {session ? '✓' : '✗'}</p>
                  <p><strong>Auth Loading:</strong> {authLoading ? '✓' : '✗'}</p>
                  <p><strong>Admin Loading:</strong> {adminLoading ? '✓' : '✗'}</p>
                  <p><strong>Is Admin:</strong> {isAdmin ? '✓' : '✗'}</p>
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Perkrauti
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Administratoriaus panelė</h1>
            <p className="text-muted-foreground mt-2">
              Valdykite vartotojus, finansus ir sistemos nustatymus
            </p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Vartotojai
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Statistikos
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Finansai
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Nustatymai
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <AdminUserManagement />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <AdminStats />
            </TabsContent>

            <TabsContent value="finance" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Balansų valdymas</CardTitle>
                    <CardDescription>
                      Pridėkite arba sumažinkite vartotojų balansus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminBalanceControl />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistemos nustatymai</CardTitle>
                  <CardDescription>
                    Konfigūruokite sistemos parametrus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sistemos nustatymai bus pridėti ateityje...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
};

export default Admin;