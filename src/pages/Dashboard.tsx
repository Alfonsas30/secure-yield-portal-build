import { useState } from "react";
import { UserProfile } from "@/components/auth/UserProfile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccountBalance } from "@/components/banking/AccountBalance";
import { QuickActions } from "@/components/banking/QuickActions";
import { TransactionHistory } from "@/components/banking/TransactionHistory";
import { Analytics } from "@/components/banking/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Banko valdymo sistema
            </h1>
            <p className="text-slate-600">
              Valdykite savo banko sąskaitą ir operacijas
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Pagrindinis</TabsTrigger>
              <TabsTrigger value="transactions">Operacijos</TabsTrigger>
              <TabsTrigger value="analytics">Ataskaitos</TabsTrigger>
              <TabsTrigger value="profile">Profilis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
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
    </ProtectedRoute>
  );
}