import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { eurToLt, formatDualCurrency } from "@/lib/currency";

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdrawal = async () => {
    const withdrawalAmountEUR = parseFloat(amount);
    
    if (!withdrawalAmountEUR || withdrawalAmountEUR <= 0 || withdrawalAmountEUR > 105000) {
      toast({
        title: t('discount.error'),
        description: t('withdrawal.amountError'),
        variant: "destructive"
      });
      return;
    }

    if (!recipientAccount || !recipientName) {
      toast({
        title: t('discount.error'),
        description: t('withdrawal.fieldsRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!profile) {
      toast({
        title: t('discount.error'),
        description: t('withdrawal.loginRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Convert EUR to LT for internal processing
      const withdrawalAmountLT = eurToLt(withdrawalAmountEUR);
      
      const { data, error } = await supabase.functions.invoke('create-withdrawal-request', {
        body: { 
          amount: withdrawalAmountLT, // Send LT amount to backend
          amountEUR: withdrawalAmountEUR, // Also send EUR for reference
          recipientAccount,
          recipientName,
          description: description || `Pinigų išėmimas €${withdrawalAmountEUR.toFixed(2)} į ${recipientName} sąskaitą ${recipientAccount}`
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t('withdrawal.success'),
          description: t('withdrawal.successDescription', { 
            amount: withdrawalAmountEUR.toFixed(2),
            recipient: recipientName 
          })
        });
        onOpenChange(false);
        setAmount("");
        setRecipientAccount("");
        setRecipientName("");
        setDescription("");
        
        // Refresh the page to show updated balance
        window.location.reload();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: t('discount.error'),
        description: error.message === 'Insufficient funds' 
          ? t('withdrawal.insufficientFunds')
          : t('withdrawal.processingError'),
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
            <Minus className="w-5 h-5 text-red-500" />
            {t('withdrawal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('withdrawal.amount')}</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                min="0.01"
                max="105000"
                step="0.01"
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
              {t('withdrawal.range')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientAccount">{t('withdrawal.recipientAccount')}</Label>
            <Input
              id="recipientAccount"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value)}
              placeholder="LT123456789012345678"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">{t('withdrawal.recipientName')}</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={t('withdrawal.recipientNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('withdrawal.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('withdrawal.descriptionPlaceholder')}
              rows={2}
            />
          </div>

          <Button 
            onClick={handleWithdrawal}
            disabled={loading || !amount || !recipientAccount || !recipientName}
            className="w-full"
            variant="destructive"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {loading ? t('withdrawal.processing') : t('withdrawal.withdraw')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}