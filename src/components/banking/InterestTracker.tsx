import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Percent, TrendingUp, Calendar, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface InterestTransaction {
  id: string;
  amount: number;
  created_at: string;
  description: string;
}

interface InterestSummary {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  todaysInterest: number;
  lastInterestDate: string | null;
}

export function InterestTracker() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<InterestTransaction[]>([]);
  const [summary, setSummary] = useState<InterestSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (profile) {
      fetchInterestData();
    }
  }, [profile, period]);

  const fetchInterestData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch interest transactions for the period
      const { data: periodTransactions, error: periodError } = await supabase
        .from('transactions')
        .select('id, amount, created_at, description')
        .eq('user_id', profile.user_id)
        .eq('transaction_type', 'daily_interest')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (periodError) {
        throw periodError;
      }

      // Fetch all interest transactions for summary
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('user_id', profile.user_id)
        .eq('transaction_type', 'daily_interest')
        .order('created_at', { ascending: false });

      if (allError) {
        throw allError;
      }

      setTransactions(periodTransactions || []);

      // Calculate summary
      if (allTransactions) {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const todaysInterest = allTransactions
          .filter(t => new Date(t.created_at) >= todayStart)
          .reduce((sum, t) => sum + t.amount, 0);

        const weeklyTotal = allTransactions
          .filter(t => new Date(t.created_at) >= weekStart)
          .reduce((sum, t) => sum + t.amount, 0);

        const monthlyTotal = allTransactions
          .filter(t => new Date(t.created_at) >= monthStart)
          .reduce((sum, t) => sum + t.amount, 0);

        const yearlyTotal = allTransactions
          .filter(t => new Date(t.created_at) >= yearStart)
          .reduce((sum, t) => sum + t.amount, 0);

        const lastInterest = allTransactions[0];

        setSummary({
          dailyTotal: todaysInterest,
          weeklyTotal,
          monthlyTotal,
          yearlyTotal,
          todaysInterest,
          lastInterestDate: lastInterest?.created_at || null
        });
      }
    } catch (error) {
      console.error('Error fetching interest data:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko gauti palūkanų duomenų",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lt-LT', {
      style: 'decimal',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount) + ' LT';
  };

  const calculateExpectedDailyInterest = (balance: number) => {
    const annualRate = 0.02; // 2%
    const dailyRate = annualRate / 365;
    return balance * dailyRate;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Palūkanų stebėjimas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Palūkanų stebėjimas (2% metinės)
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Savaitė</SelectItem>
              <SelectItem value="month">Mėnuo</SelectItem>
              <SelectItem value="year">Metai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Šiandien</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summary.todaysInterest)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary.lastInterestDate && (
                    <>Paskutinės: {new Date(summary.lastInterestDate).toLocaleString('lt-LT')}</>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Savaitė</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summary.weeklyTotal)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Mėnuo</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summary.monthlyTotal)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Metai</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(summary.yearlyTotal)}
                </div>
              </div>
            </div>

            {/* Interest Transactions List */}
            <div className="space-y-3">
              <h4 className="font-semibold">Palūkanų istorija ({period})</h4>
              {transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nėra palūkanų transakcijų pasirinktam periodui
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                      <div>
                        <div className="font-medium text-sm">Dienos palūkanos</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString('lt-LT')}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +{formatCurrency(transaction.amount)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Automatinis
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Palūkanų informacija
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Metinė palūkanų norma: 2%</p>
                <p>• Dienos palūkanų norma: ~0.0055%</p>
                <p>• Palūkanos skaičiuojamos kasdien nuo balanso</p>
                <p>• Palūkanos pridedamos automatiškai kiekvieną dieną 00:01</p>
                {summary.todaysInterest === 0 && (
                  <p className="text-amber-600">• Šiandien palūkanos dar neapskaičiuotos arba balansas 0</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}