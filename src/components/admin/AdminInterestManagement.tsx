import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Play, RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface TodayStatus {
  calculated_today: boolean;
  accounts_processed?: number;
  total_interest_paid?: number;
  calculated_at?: string;
}

export function AdminInterestManagement() {
  const [calculating, setCalculating] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Check today's calculation status
  const { data: todayStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["todayInterestStatus"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_daily_interest_status');
      if (error) throw error;
      return data as unknown as TodayStatus;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get recent calculations
  const { data: recentCalculations, refetch: refetchCalculations } = useQuery({
    queryKey: ["recentInterestCalculations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_interest_calculations')
        .select('*')
        .order('calculation_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Get accounts with balances
  const { data: accountsData } = useQuery({
    queryKey: ["accountsWithBalances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_balances')
        .select('user_id, balance, account_number')
        .gt('balance', 0)
        .order('balance', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const runDailyInterestCalculation = async () => {
    setCalculating(true);
    try {
      const { data, error } = await supabase.rpc('calculate_daily_interest');
      
      if (error) throw error;
      
      setTestResult(data);
      toast.success("Palūkanų skaičiavimas sėkmingai atliktas!");
      
      // Refresh data
      refetchStatus();
      refetchCalculations();
    } catch (error: any) {
      console.error('Error calculating interest:', error);
      toast.error(`Klaida skaičiuojant palūkanas: ${error.message}`);
      setTestResult({ success: false, error: error.message });
    } finally {
      setCalculating(false);
    }
  };

  const testInterestPreview = async (balance: number) => {
    try {
      const { data, error } = await supabase.rpc('get_daily_interest_preview', {
        target_balance: balance
      });
      
      if (error) throw error;
      
      toast.success(`Testas balansui ${balance} LT atliktas!`);
      console.log('Interest preview for', balance, 'LT:', data);
    } catch (error: any) {
      console.error('Error in interest preview:', error);
      toast.error(`Klaida testuojant palūkanas: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lt-LT');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Palūkanų administravimas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Today's Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Šiandienos statusas</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('lt-LT')}
                    </p>
                  </div>
                  {todayStatus?.calculated_today ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Apskaičiuota
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-200 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Laukia
                    </Badge>
                  )}
                </div>
                
                {todayStatus?.calculated_today && (
                  <div className="mt-3 text-sm space-y-1">
                    <p>Apdorotų sąskaitų: {todayStatus.accounts_processed}</p>
                    <p>Mokėtos palūkanos: {Number(todayStatus.total_interest_paid).toFixed(2)} LT</p>
                    <p>Skaičiuota: {formatDate(todayStatus.calculated_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Aktyvių sąskaitų</h4>
                  <Badge variant="outline">
                    {accountsData?.length || 0}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Bendras balansas: {accountsData?.reduce((sum, acc) => sum + Number(acc.balance), 0).toFixed(2)} LT</p>
                  <p>Didžiausias balansas: {accountsData?.[0] ? Number(accountsData[0].balance).toFixed(2) : '0'} LT</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manual Calculation */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Rankinis palūkanų skaičiavimas
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Paleisti dienos palūkanų skaičiavimą visiems balansams
                  </p>
                </div>
                <Button 
                  onClick={runDailyInterestCalculation}
                  disabled={calculating || todayStatus?.calculated_today}
                  className="flex items-center gap-2"
                >
                  {calculating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  {calculating ? 'Skaičiuoja...' : 'Skaičiuoti palūkanas'}
                </Button>
              </div>
              
              {todayStatus?.calculated_today && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Šiandien palūkanos jau buvo apskaičiuotos. Pakartotinis skaičiavimas negalimas.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Test Interest Calculations */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Testavimas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[100, 1000, 10000, 100000].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => testInterestPreview(amount)}
                    className="text-xs"
                  >
                    Test {amount} LT
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calculation Result */}
          {testResult && (
            <Card className={testResult.success ? "border-green-200" : "border-red-200"}>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Paskutinio skaičiavimo rezultatas</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Recent Calculations History */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Paskutinių skaičiavimų istorija</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentCalculations?.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">
                        {new Date(calc.calculation_date).toLocaleDateString('lt-LT')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(calc.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {calc.accounts_processed} sąsk. | {Number(calc.total_interest_paid).toFixed(2)} LT
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {calc.initiated_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}