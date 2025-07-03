import { useState } from "react";
import { UserProfile } from "@/components/auth/UserProfile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionTimer } from "@/components/auth/SessionTimer";
import { TOTPSetupModal } from "@/components/auth/TOTPSetupModal";
import { AccountBalance } from "@/components/banking/AccountBalance";
import { QuickActions } from "@/components/banking/QuickActions";
import { TransactionHistory } from "@/components/banking/TransactionHistory";
import { Analytics } from "@/components/banking/Analytics";
import NewsletterAdmin from "@/components/NewsletterAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useDashboardSecurity } from "@/hooks/useDashboardSecurity";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { showTOTPSetup, setShowTOTPSetup } = useAuth();
  
  // Enable dashboard security features
  useDashboardSecurity();

  const handleTOTPSetupComplete = (backupCodes: string[]) => {
    console.log('TOTP setup completed in Dashboard with backup codes:', backupCodes);
    // TOTP setup completed successfully - modal will close automatically
  };

  return (
    <ProtectedRoute>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1" />
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Banko valdymo sistema
                </h1>
                <p className="text-slate-600">
                  Valdykite savo banko sąskaitą ir operacijas
                </p>
              </div>
              <div className="flex-1 flex justify-end">
                <SessionTimer />
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6 md:mb-8 text-xs md:text-sm">
              <TabsTrigger value="overview">Pagrindinis</TabsTrigger>
              <TabsTrigger value="transactions">Operacijos</TabsTrigger>
              <TabsTrigger value="analytics">Ataskaitos</TabsTrigger>
              <TabsTrigger value="newsletter">Naujienlaiškis</TabsTrigger>
              <TabsTrigger value="profile">Profilis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <AccountBalance />
                </div>
                <div>
                  <QuickActions 
                    onViewTransactions={() => setActiveTab("transactions")}
                    onViewReports={() => setActiveTab("analytics")}
                  />
                </div>
              </div>
              
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>

            <TabsContent value="newsletter">
              <NewsletterAdmin />
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardContent className="p-6">
                  <UserProfile />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* TOTP Setup Modal */}
      <TOTPSetupModal 
        open={showTOTPSetup} 
        onOpenChange={setShowTOTPSetup}
        onSetupComplete={handleTOTPSetupComplete}
      />
    </ProtectedRoute>
  );
}