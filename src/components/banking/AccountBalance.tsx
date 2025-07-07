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
  const { profile, user, session } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [lastInterest, setLastInterest] = useState<LastInterestTransaction | null>(null);

  useEffect(() => {
    console.log('=== ACCOUNT BALANCE AUTH CHECK ===');
    console.log('User ID:', user?.id);
    console.log('Profile user_id:', profile?.user_id);
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    
    // Only fetch data if we have a valid session and profile
    if (profile && user && session && session.user.id === profile.user_id) {
      console.log('Fetching balance for verified user:', profile.user_id);
      fetchBalance();
      fetchLastInterest();
    } else if (profile && user) {
      console.error('Session/profile mismatch - potential security issue!');
      console.error('Session user:', session?.user?.id);
      console.error('Profile user:', profile.user_id);
      console.error('Auth user:', user.id);
    }
  }, [profile, user, session]);

  const fetchLastInterest = async () => {
    if (!profile || !user || !session) {
      console.log('Skipping interest fetch - missing auth data');
      return;
    }
    
    try {
      console.log('Fetching last interest for user:', profile.user_id);
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('user_id', profile.user_id)
        .eq('transaction_type', 'daily_interest')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching last interest:', error);
      } else if (data) {
        console.log('Last interest fetched:', data);
        setLastInterest(data);
      } else {
        console.log('No interest transactions found');
      }
    } catch (error) {
      console.error('Exception fetching last interest:', error);
    }
  };

  const fetchBalance = async () => {
    if (!profile || !user || !session) {
      console.log('Skipping balance fetch - missing auth data');
      setLoading(false);
      return;
    }

    // Verify session is valid and matches profile
    if (session.user.id !== profile.user_id) {
      console.error('CRITICAL: Session user mismatch!');
      console.error('Session user:', session.user.id);
      console.error('Profile user:', profile.user_id);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching balance for user:', profile.user_id);
      const { data, error } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching balance:', error);
        console.error('This might indicate RLS policy issues or auth problems');
        toast({
          title: t('discount.error'),
          description: t('accountBalance.loadError'),
          variant: "destructive"
        });
      } else if (data) {
        console.log('Balance fetched successfully:', data.balance, 'for account:', data.account_number);
        setBalance(data);
      } else {
        console.log('No balance found, creating default balance');
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
          console.log('Default balance created:', newBalance);
          setBalance(newBalance);
        }
      }
    } catch (error) {
      console.error('Exception in fetchBalance:', error);
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