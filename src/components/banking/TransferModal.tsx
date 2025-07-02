import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    toAccount: "",
    toName: "",
    amount: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      
      if (amount <= 0) {
        toast({
          title: "Klaida",
          description: "Suma turi būti teigiama",
          variant: "destructive"
        });
        return;
      }

      // Create transfer request
      const { error: transferError } = await supabase
        .from('transfer_requests')
        .insert({
          from_user_id: profile.user_id,
          from_account: profile.account_number,
          to_account: formData.toAccount,
          to_name: formData.toName,
          amount: amount,
          description: formData.description || null
        });

      if (transferError) throw transferError;

      // Create outgoing transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.user_id,
          account_number: profile.account_number,
          transaction_type: 'transfer_out',
          amount: -amount, // Negative for outgoing
          recipient_account: formData.toAccount,
          recipient_name: formData.toName,
          description: formData.description || null
        });

      if (transactionError) throw transactionError;

      // Update balance (subtract amount)
      const { data: currentBalance } = await supabase
        .from('account_balances')
        .select('balance')
        .eq('user_id', profile.user_id)
        .single();

      if (currentBalance) {
        const { error: updateError } = await supabase
          .from('account_balances')
          .update({ balance: currentBalance.balance - amount })
          .eq('user_id', profile.user_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Pervedimas sėkmingas",
        description: `Pervedėte ${amount} LT į sąskaitą ${formData.toAccount}`,
        variant: "default"
      });

      setFormData({ toAccount: "", toName: "", amount: "", description: "" });
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Pervedimo klaida",
        description: "Nepavyko įvykdyti pervedimo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pinigų pervedimas</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="toAccount">Gavėjo sąskaitos numeris</Label>
            <Input
              id="toAccount"
              value={formData.toAccount}
              onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
              placeholder="LT############"
              required
            />
          </div>

          <div>
            <Label htmlFor="toName">Gavėjo vardas, pavardė</Label>
            <Input
              id="toName"
              value={formData.toName}
              onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
              placeholder="Vardas Pavardė"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Suma (LT)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Paskirtis (neprivaloma)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mokėjimo paskirtis..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Vykdoma..." : "Pervesti"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Atšaukti
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}