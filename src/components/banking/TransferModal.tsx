import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ltToEur, formatCurrency } from "@/lib/currency";
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from "lucide-react";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    toAccount: "",
    toName: "",
    amount: "",
    description: ""
  });
  const [validationError, setValidationError] = useState<string>("");

  // Validate account number format
  const validateAccountNumber = (accountNumber: string): boolean => {
    const pattern = /^LT[0-9]{12}$/;
    return pattern.test(accountNumber);
  };

  // Validate form data
  const validateForm = (): string | null => {
    const amount = parseFloat(formData.amount);
    
    if (amount <= 0) {
      return "Suma turi būti teigiama";
    }

    if (!validateAccountNumber(formData.toAccount)) {
      return "Neteisingas sąskaitos numerio formatas. Turi būti: LT + 12 skaitmenų";
    }

    if (formData.toAccount === profile?.account_number) {
      return "Negalite pervesti pinigų į savo pačių sąskaitą";
    }

    if (!formData.toName.trim()) {
      return "Gavėjo vardas yra privalomas";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    console.log('🔄 Transfer started:', {
      from: profile.account_number,
      to: formData.toAccount,
      amount: formData.amount,
      name: formData.toName
    });

    setValidationError("");
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setValidationError(validationError);
      console.log('❌ Validation failed:', validationError);
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      
      console.log('📤 Calling process_internal_transfer function...');
      
      // Use the new comprehensive transfer function
      const { data, error } = await supabase.rpc('process_internal_transfer', {
        p_from_user_id: profile.user_id,
        p_to_account_number: formData.toAccount,
        p_amount: amount,
        p_description: formData.description || `Pervedimas iš ${profile.account_number}`,
        p_recipient_name: formData.toName
      });

      console.log('📥 Transfer function response:', { data, error });

      if (error) {
        console.error('❌ Transfer function error:', error);
        throw error;
      }

      const result = data as { 
        success: boolean; 
        error?: string; 
        from_new_balance?: number;
        to_new_balance?: number;
        transfer_id?: string;
      };
      
      if (!result.success) {
        console.log('❌ Transfer failed:', result.error);
        
        let errorMessage = result.error || 'Pervedimas nepavyko';
        
        // Provide specific error messages
        if (result.error === 'Insufficient funds') {
          errorMessage = 'Nepakanka lėšų sąskaitoje';
        } else if (result.error === 'Recipient account not found') {
          errorMessage = 'Gavėjo sąskaita nerasta mūsų sistemoje';
        } else if (result.error === 'Cannot transfer to your own account') {
          errorMessage = 'Negalite pervesti pinigų į savo pačių sąskaitą';
        }
        
        toast({
          title: "Pervedimo klaida",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Transfer successful:', {
        transferId: result.transfer_id,
        newBalance: result.from_new_balance
      });

      toast({
        title: "Pervedimas sėkmingas",
        description: `Pervesta ${amount} LT į sąskaitą ${formData.toAccount}. Naujas balansas: ${result.from_new_balance?.toFixed(2)} LT`,
        variant: "default"
      });

      setFormData({ toAccount: "", toName: "", amount: "", description: "" });
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Transfer error:', error);
      toast({
        title: "Pervedimo klaida",
        description: "Pervedimas nepavyko. Bandykite dar kartą.",
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
          <DialogTitle>{t('transfer.title')}</DialogTitle>
        </DialogHeader>
        
        {validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="toAccount">{t('transfer.recipientAccount')}</Label>
            <Input
              id="toAccount"
              value={formData.toAccount}
              onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
              placeholder="LT############"
              required
            />
          </div>

          <div>
            <Label htmlFor="toName">{t('transfer.recipientName')}</Label>
            <Input
              id="toName"
              value={formData.toName}
              onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
              placeholder={t('transfer.recipientNamePlaceholder')}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">{t('transfer.amount')}</Label>
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
            <Label htmlFor="description">{t('transfer.purpose')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('transfer.purposePlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('transfer.processing') : t('transfer.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('transfer.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}