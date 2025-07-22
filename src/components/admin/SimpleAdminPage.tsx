
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, User } from 'lucide-react';

export function SimpleAdminPage() {
  console.log('=== SimpleAdminPage rendering ===');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('SimpleAdminPage - User:', user?.email);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-500" />
              Simple Admin Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Administratoriaus panelė veikia!
                </h3>
                <p className="text-green-700">
                  Admin prieiga sėkmingai patvirtinta ir puslapis užkrautas be klaidų.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Vartotojas</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.email || 'Neprisijungęs'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Prisijungimo laikas</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().toLocaleString('lt-LT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/admin-full')}
                  className="flex-1"
                >
                  Eiti į pilną admin panelę
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Grįžti į dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
