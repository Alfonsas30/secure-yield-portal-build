
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
import { Users, BarChart, DollarSign, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('Full Admin panel loaded for user:', user?.email);
    setIsLoaded(true);
  }, [user]);

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Pilna administratoriaus panelė</h1>
                <p className="text-muted-foreground mt-2">
                  Valdykite vartotojus, finansus ir sistemos nustatymus
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Atgal į paprastą panelę
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Vartotojas: {user?.email} | Status: {isLoaded ? 'Užkrauta' : 'Kraunama...'}
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
