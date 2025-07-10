import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  recipient_account?: string;
  recipient_name?: string;
  description?: string;
  status: string;
  created_at: string;
}

export function TransactionHistory() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    if (profile) {
      fetchTransactions();
    }
  }, [profile, timeFilter]);

  const fetchTransactions = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      // Apply time filter
      if (timeFilter !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
          case "day":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
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
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: t('transactions.error'),
          description: t('transactions.loadError'),
          variant: "destructive"
        });
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('lt-LT', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount)) + ' LT';
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
    } else {
      return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'transfer_out':
        return t('transactions.types.transferOut');
      case 'transfer_in':
        return t('transactions.types.transferIn');
      case 'deposit':
        return t('transactions.types.deposit');
      case 'withdrawal':
        return t('transactions.types.withdrawal');
      case 'daily_interest':
        return 'Dienos palūkanos';
      default:
        return type;
    }
  };

  const exportTransactions = () => {
    if (transactions.length === 0) {
      toast({
        title: t('transactions.noData'),
        description: t('transactions.noDataToExport'),
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      [t('transactions.date'), t('transactions.type'), t('transactions.amount'), t('transactions.recipient'), t('transactions.purpose'), t('transactions.status')].join(','),
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString('lt-LT'),
        getTransactionType(t.transaction_type),
        formatCurrency(t.amount, t.currency),
        t.recipient_name || '-',
        t.description || '-',
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${t('transactions.fileName')}_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('transactions.title')}
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.filters.all')}</SelectItem>
                <SelectItem value="day">{t('transactions.filters.today')}</SelectItem>
                <SelectItem value="week">{t('transactions.filters.week')}</SelectItem>
                <SelectItem value="month">{t('transactions.filters.month')}</SelectItem>
                <SelectItem value="year">{t('transactions.filters.year')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportTransactions}>
              <Download className="w-4 h-4 mr-2" />
              {t('transactions.export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded">
                <div className="w-5 h-5 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('transactions.noTransactions')}
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 p-3 border rounded hover:bg-muted/50 transition-colors">
                {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                
                <div className="flex-1">
                  <div className="font-medium">
                    {getTransactionType(transaction.transaction_type)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                     {transaction.recipient_name && (
                       <span>{t('transactions.recipient')}: {transaction.recipient_name} • </span>
                     )}
                    {new Date(transaction.created_at).toLocaleString('lt-LT')}
                  </div>
                  {transaction.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {transaction.description}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                   <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                     {transaction.status === 'completed' ? t('transactions.status.completed') : 
                      transaction.status === 'pending' ? t('transactions.status.pending') : t('transactions.status.failed')}
                   </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}