import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDualCurrency } from "@/lib/currency";
import { FileText, Calendar, TrendingUp, User, CreditCard, CheckCircle } from "lucide-react";

interface TermDepositContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  termMonths: number;
  interestRate: number;
  onSuccess: () => void;
}

export function TermDepositContractModal({
  open,
  onOpenChange,
  amount,
  termMonths,
  interestRate,
  onSuccess
}: TermDepositContractModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const calculateMaturityDate = () => {
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + termMonths);
    return maturityDate;
  };

  const calculateTotalReturn = () => {
    const years = termMonths / 12;
    return amount * Math.pow(1 + interestRate / 100, years);
  };

  const handleSignContract = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const maturityDate = calculateMaturityDate();

      // Create term deposit contract
      const { error: depositError } = await supabase
        .from('term_deposits')
        .insert({
          user_id: profile.user_id,
          account_number: profile.account_number,
          amount,
          term_months: termMonths,
          interest_rate: interestRate,
          maturity_date: maturityDate.toISOString(),
          status: 'active'
        });

      if (depositError) throw depositError;

      // Use atomic balance update function for security
      const { data: balanceResult, error: balanceError } = await supabase.rpc('atomic_balance_update', {
        p_user_id: profile.user_id,
        p_amount: -amount, // Negative for investment
        p_transaction_type: 'term_deposit',
        p_description: `Terminuotas indėlis ${termMonths} mėn. su ${interestRate}% palūkanomis`
      });

      if (balanceError) throw balanceError;

      const result = balanceResult as { success: boolean; error?: string };
      
      if (!result.success) {
        toast({
          title: "Klaida",
          description: result.error === 'Insufficient funds' ? "Nepakanka lėšų terminuotam indėliui" : "Nepavyko sukurti terminuoto indėlio",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sutartis sėkmingai pasirašyta!",
        description: `Terminuotas indėlis ${formatDualCurrency(amount)} suformuotas ${termMonths} mėnesiams`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko pasirašyti sutarties. Bandykite dar kartą.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const maturityDate = calculateMaturityDate();
  const totalReturn = calculateTotalReturn();
  const profit = totalReturn - amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6" />
            Terminuoto indėlio sutartis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Sutarties informacija</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm text-slate-600">Klientas</div>
                  <div className="font-medium">{profile?.display_name || profile?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm text-slate-600">Sąskaita</div>
                  <div className="font-medium">{profile?.account_number}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Investuojama suma:</span>
              <Badge variant="outline" className="text-lg font-semibold">
                {formatDualCurrency(amount)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Sutarties terminas:</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{termMonths} mėnesiai</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Metinė palūkanų norma:</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">{interestRate}%</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Suma grąžinimo dieną:</span>
                <span className="text-xl font-bold text-green-700">
                  {formatDualCurrency(totalReturn)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Jūsų pelnas:</span>
                <span className="text-lg font-semibold text-green-600">
                  +{formatDualCurrency(profit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Grąžinimo data:</span>
                <span className="font-medium">
                  {maturityDate.toLocaleDateString('lt-LT')}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
            <h4 className="font-semibold mb-2">Sutarties sąlygos:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Indėlis bus užblokuotas visam sutarties terminui</li>
              <li>Palūkanos bus priskaičiuotos sutarties pabaigoje</li>
              <li>Pirmalaikis sutarties nutraukimas galimas tik su baudos mokesčiu</li>
              <li>Automatinis sutarties pratęsimas galimas atskirai susitarus</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Atšaukti
            </Button>
            <Button
              onClick={handleSignContract}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? (
                "Formuojama sutartis..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pasirašyti sutartį
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}