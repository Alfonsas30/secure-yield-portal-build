import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalBalance: number;
  totalTransactions: number;
  dailyInterest: number;
  newUsersToday: number;
  transactionsToday: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    dailyInterest: 0,
    newUsersToday: 0,
    transactionsToday: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total balance
      const { data: balanceData } = await supabase
        .from('account_balances')
        .select('balance');

      const totalBalance = balanceData?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;

      // Get total transactions
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Get daily interest transactions
      const { data: interestData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'daily_interest')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      const dailyInterest = interestData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      // Get new users today
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      // Get transactions today
      const { count: transactionsToday } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalBalance,
        totalTransactions: totalTransactions || 0,
        dailyInterest,
        newUsersToday: newUsersToday || 0,
        transactionsToday: transactionsToday || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Viso vartotojų',
      value: stats.totalUsers.toLocaleString(),
      description: `${stats.newUsersToday} nauji šiandien`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Bendras balansas',
      value: `${stats.totalBalance.toFixed(2)} LT`,
      description: 'Visų sąskaitų balansas',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Viso transakcijų',
      value: stats.totalTransactions.toLocaleString(),
      description: `${stats.transactionsToday} šiandien`,
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Dienos palūkanos',
      value: `${stats.dailyInterest.toFixed(2)} LT`,
      description: 'Šiandien išmokėta',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sistemos veiklos rodikliai</CardTitle>
            <CardDescription>
              Realaus laiko sistemos informacija
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Aktyvūs vartotojai</span>
                <span className="text-sm font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bendras balansas</span>
                <span className="text-sm font-medium">{stats.totalBalance.toFixed(2)} LT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transakcijos šiandien</span>
                <span className="text-sm font-medium">{stats.transactionsToday}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finansų suvestinė</CardTitle>
            <CardDescription>
              Finansų valdymo informacija
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Išmokėtos palūkanos šiandien</span>
                <span className="text-sm font-medium text-green-600">+{stats.dailyInterest.toFixed(2)} LT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vidutinis balansas</span>
                <span className="text-sm font-medium">
                  {stats.totalUsers > 0 ? (stats.totalBalance / stats.totalUsers).toFixed(2) : '0.00'} LT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Viso transakcijų</span>
                <span className="text-sm font-medium">{stats.totalTransactions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}