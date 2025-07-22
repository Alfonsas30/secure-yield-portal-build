
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminBalanceControl } from '@/components/banking/AdminBalanceControl';
import { AdminInterestManagement } from '@/components/admin/AdminInterestManagement';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BarChart, DollarSign, Settings, AlertTriangle } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';

const Admin = () => {
  console.log('=== ADMIN COMPONENT RENDER START ===');
  
  const { user, session, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, error: adminError } = useAdminRole();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`Admin component render #${renderCount + 1}`);
    console.log('Admin component state:', {
      user: user?.id,
      session: !!session,
      authLoading,
      adminLoading,
      isAdmin,
      adminError
    });
  }, [user, session, authLoading, adminLoading, isAdmin, adminError, renderCount]);

  // Show loading state
  if (authLoading || adminLoading) {
    console.log('Admin component showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Kraunama administratoriaus panelė...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Auth loading: {authLoading ? 'taip' : 'ne'}, Admin loading: {adminLoading ? 'taip' : 'ne'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if there's an admin error
  if (adminError) {
    console.log('Admin component showing error state:', adminError);
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
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{adminError}</p>
            <Button onClick={() => window.location.reload()}>
              Perkrauti puslapį
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    console.log('Admin component showing access denied');
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
              <div className="text-center">
                <p className="mb-4">Jūs neturite administratoriaus teisių šiai sistemai pasiekti.</p>
                <div className="text-xs text-muted-foreground mb-4">
                  <p>User ID: {user?.id}</p>
                  <p>Email: {user?.email}</p>
                  <p>Is Admin: {isAdmin ? 'taip' : 'ne'}</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Grįžti į pagrindinį puslapį
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('Admin component rendering main content');

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Administratoriaus panelė</h1>
            <p className="text-muted-foreground mt-2">
              Valdykite vartotojus, finansus ir sistemos nustatymus
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              Render #{renderCount} | User: {user?.email} | Admin: {isAdmin ? 'taip' : 'ne'}
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="interest" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Palūkanos
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

            <TabsContent value="interest" className="space-y-6">
              <AdminInterestManagement />
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
    </AdminErrorBoundary>
  );
};

export default Admin;
