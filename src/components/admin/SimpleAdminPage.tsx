
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SimpleAdminPage() {
  console.log('=== SimpleAdminPage rendering ===');
  
  const { user } = useAuth();
  
  console.log('SimpleAdminPage - User:', user?.email);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Simple Admin Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Administratoriaus panelė veikia!</p>
              <p>Vartotojas: {user?.email || 'Neprisijungęs'}</p>
              <p>Laikas: {new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
