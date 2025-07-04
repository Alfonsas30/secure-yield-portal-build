import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Eye, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDualCurrency } from "@/lib/currency";
import { useTranslation } from 'react-i18next';

interface AccountBalance {
  id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

interface LastInterestTransaction {
  created_at: string;
  amount: number;
}

export function AccountBalance() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [lastInterest, setLastInterest] = useState<LastInterestTransaction | null>(null);

  useEffect(() => {
    if (profile) {
      fetchBalance();
      fetchLastInterest();
    }
  }, [profile]);

  const fetchLastInterest = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('user_id', profile.user_id)
        .eq('transaction_type', 'daily_interest')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLastInterest(data);
      }
    } catch (error) {
      console.error('Error fetching last interest:', error);
    }
  };

  const fetchBalance = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching balance:', error);
        toast({
          title: t('discount.error'),
          description: t('accountBalance.loadError'),
          variant: "destructive"
        });
      } else if (data) {
        setBalance(data);
      } else {
        // No balance found, create one with default amount
        const { data: newBalance, error: createError } = await supabase
          .from('account_balances')
          .insert({
            user_id: profile.user_id,
            account_number: profile.account_number,
            balance: 0.00,
            currency: 'LT'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating balance:', createError);
          toast({
            title: t('discount.error'),
            description: t('accountBalance.createError'),
            variant: "destructive"
          });
        } else {
          setBalance(newBalance);
        }
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
    }).format(amount) + ' LT';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {t('accountBalance.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {t('accountBalance.title')}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 p-0"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">
              {showBalance && balance 
                ? formatCurrency(balance.balance, balance.currency)
                : "••••••"
              }
            </div>
            {showBalance && balance && (
              <div className="text-sm text-muted-foreground">
                ≈ {formatDualCurrency(balance.balance).split('(≈')[1]?.replace(')', '')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {t('accountBalance.active')}
            </Badge>
            {balance && (
              <span>
                {t('accountBalance.updated')}: {new Date(balance.updated_at).toLocaleDateString('lt-LT')}
              </span>
            )}
          </div>
          {lastInterest && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="w-3 h-3" />
              <span>
                Paskutinės palūkanos: +{lastInterest.amount.toFixed(2)} LT ({new Date(lastInterest.created_at).toLocaleDateString('lt-LT')})
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}