import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';

export function AdminBalanceControl() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState('2000000');
  const [description, setDescription] = useState('Admin balance adjustment');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingInterest, setIsCalculatingInterest] = useState(false);
  const [interestStatus, setInterestStatus] = useState<any>(null);
  
  useEffect(() => {
    checkInterestStatus();
  }, []);

  const checkInterestStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('check_daily_interest_status');
      if (error) throw error;
      setInterestStatus(data);
    } catch (error) {
      console.error('Error checking interest status:', error);
    }
  };

  const handleAddBalance = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive'
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Adding balance:', { amount, userId: user.id, description });

      const { data, error } = await supabase.functions.invoke('admin-add-balance', {
        body: {
          amount: parseFloat(amount),
          userId: user.id,
          description: description
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to add balance');
      }

      toast({
        title: 'Success',
        description: `Successfully added ${amount} LT to your account. New balance: ${data.newBalance} LT`,
        variant: 'default'
      });

      // Refresh the page to show updated balance
      window.location.reload();

    } catch (error: any) {
      console.error('Add balance error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add balance',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateInterest = async () => {
    setIsCalculatingInterest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-daily-interest');
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate interest');
      }
      
      toast({
        title: 'Palūkanos apskaičiuotos',
        description: `Apdorota ${data.accounts_processed} sąskaitų, išmokėta ${data.total_interest_paid.toFixed(2)} LT palūkanų`,
        variant: 'default'
      });
      
      // Refresh interest status
      await checkInterestStatus();
      
    } catch (error: any) {
      console.error('Interest calculation error:', error);
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko apskaičiuoti palūkanų',
        variant: 'destructive'
      });
    } finally {
      setIsCalculatingInterest(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Daily Interest Status */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Dienos palūkanos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interestStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Šiandienos būsena:</span>
                <Badge 
                  variant={interestStatus.calculated_today ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {interestStatus.calculated_today ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {interestStatus.calculated_today ? 'Apskaičiuotos' : 'Neapskaičiuotos'}
                </Badge>
              </div>
              
              {interestStatus.calculated_today && (
                <>
                  <div className="text-sm">
                    <div>Apdorota sąskaitų: <strong>{interestStatus.accounts_processed}</strong></div>
                    <div>Išmokėta palūkanų: <strong>{interestStatus.total_interest_paid?.toFixed(2)} LT</strong></div>
                    <div className="text-muted-foreground">
                      {new Date(interestStatus.calculated_at).toLocaleString('lt-LT')}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleCalculateInterest}
            disabled={isCalculatingInterest}
            variant={interestStatus?.calculated_today ? "outline" : "default"}
            className="w-full"
          >
            {isCalculatingInterest ? 'Skaičiuoja...' : 
             interestStatus?.calculated_today ? 'Perskaičiuoti palūkanas' : 'Apskaičiuoti palūkanas'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Balance Control */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin: Add Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (LT)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Transaction description"
          />
        </div>

        <Button 
          onClick={handleAddBalance} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Adding...' : `Add ${amount} LT`}
        </Button>
        </CardContent>
      </Card>
    </div>
  );
}