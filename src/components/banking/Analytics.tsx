import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  avgTransactionAmount: number;
  periodStart: string;
  periodEnd: string;
}

export function Analytics() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (profile) {
      fetchAnalytics();
    }
  }, [profile, period]);

  const fetchAnalytics = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, transaction_type, created_at')
        .eq('user_id', profile.user_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: "Klaida",
          description: "Nepavyko įkelti analitikos duomenų",
          variant: "destructive"
        });
        return;
      }

      const income = transactions
        ?.filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const expenses = Math.abs(transactions
        ?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0) || 0);

      const transactionCount = transactions?.length || 0;
      const avgAmount = transactionCount > 0 
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactionCount 
        : 0;

      setAnalytics({
        totalIncome: income,
        totalExpenses: expenses,
        transactionCount,
        avgTransactionAmount: avgAmount,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString()
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lt-LT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "week": return "Savaitės";
      case "month": return "Mėnesio";
      case "quarter": return "Ketvirčio";
      case "year": return "Metų";
      default: return "Laikotarpio";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Ataskaitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
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
            <BarChart3 className="w-5 h-5" />
            {getPeriodLabel()} ataskaita
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Savaitė</SelectItem>
              <SelectItem value="month">Mėnuo</SelectItem>
              <SelectItem value="quarter">Ketvirtis</SelectItem>
              <SelectItem value="year">Metai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Pajamos</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.totalIncome)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">Išlaidos</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.totalExpenses)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <PieChart className="w-4 h-4" />
                  <span className="text-sm font-medium">Balansas</span>
                </div>
                <div className={`text-2xl font-bold ${
                  analytics.totalIncome - analytics.totalExpenses >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(analytics.totalIncome - analytics.totalExpenses)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Operacijos</span>
                </div>
                <div className="text-2xl font-bold">
                  {analytics.transactionCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Vid. {formatCurrency(analytics.avgTransactionAmount)}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">{getPeriodLabel()} suvestinė</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Laikotarpis: {new Date(analytics.periodStart).toLocaleDateString('lt-LT')} - 
                  {new Date(analytics.periodEnd).toLocaleDateString('lt-LT')}
                </p>
                <p>
                  Vidutinė operacija: {formatCurrency(analytics.avgTransactionAmount)}
                </p>
                <p>
                  {analytics.totalIncome > analytics.totalExpenses ? 
                    `Taupymas: ${formatCurrency(analytics.totalIncome - analytics.totalExpenses)}` :
                    `Deficitas: ${formatCurrency(analytics.totalExpenses - analytics.totalIncome)}`
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nėra duomenų pasirinktam laikotarpiui
          </div>
        )}
      </CardContent>
    </Card>
  );
}