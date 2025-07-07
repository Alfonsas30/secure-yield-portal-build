import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminBalanceControl } from '@/components/banking/AdminBalanceControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, DollarSign, Settings } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Kraunama...</p>
        </div>
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
              Jūs neturite administratoriaus teisių šiai sistemai pasiekti.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
};

export default Admin;