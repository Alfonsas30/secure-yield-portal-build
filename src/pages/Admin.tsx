
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminBalanceControl } from '@/components/banking/AdminBalanceControl';
import { AdminInterestManagement } from '@/components/admin/AdminInterestManagement';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, DollarSign, Settings } from 'lucide-react';

const Admin = () => {
  console.log('=== ADMIN COMPONENT RENDER START ===');
  
  const { user } = useAuth();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`Admin component render #${renderCount + 1}`);
    console.log('Admin component user:', user?.id);
  }, [renderCount, user]);

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
              Render #{renderCount} | User: {user?.email}
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
