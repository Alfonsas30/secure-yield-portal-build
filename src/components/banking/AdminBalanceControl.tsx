import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function AdminBalanceControl() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState('2000000');
  const [description, setDescription] = useState('Admin balance adjustment');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
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
  );
}