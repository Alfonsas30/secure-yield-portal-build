import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount < 1 || depositAmount > 10000) {
      toast({
        title: t('discount.error'),
        description: t('deposit.amountError'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-deposit-payment', {
        body: { amount: depositAmount }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
        setAmount("");
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: t('discount.error'),
        description: t('deposit.paymentError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('deposit.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('deposit.amount')}</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                min="1"
                max="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                EUR
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('deposit.range')}
            </p>
          </div>

          <Button 
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? t('deposit.processing') : t('deposit.pay')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}