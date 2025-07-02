import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ltToEur, formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
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

      // Use atomic balance update function for security
      const { data, error } = await supabase.rpc('atomic_balance_update', {
        p_user_id: profile.user_id,
        p_amount: -amount, // Negative for outgoing transfer
        p_transaction_type: 'transfer_out',
        p_description: formData.description || `Pervedimas į ${formData.toAccount}`,
        p_recipient_account: formData.toAccount,
        p_recipient_name: formData.toName
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number };
      
      if (!result.success) {
        toast({
          title: "Pervedimo klaida",
          description: result.error === 'Insufficient funds' ? "Nepakanka lėšų" : "Nepavyko įvykdyti pervedimo",
          variant: "destructive"
        });
        return;
      }

      // Create transfer request record
      await supabase
        .from('transfer_requests')
        .insert({
          from_user_id: profile.user_id,
          from_account: profile.account_number,
          to_account: formData.toAccount,
          to_name: formData.toName,
          amount: amount,
          description: formData.description || null,
          status: 'completed'
        });

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
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                ≈ {formatCurrency(ltToEur(parseFloat(formData.amount)), 'EUR')}
              </div>
            )}
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