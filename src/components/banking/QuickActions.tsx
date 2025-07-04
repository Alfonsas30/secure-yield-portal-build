import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Plus, Download, BarChart3, Calculator, Minus } from "lucide-react";
import { TransferModal } from "./TransferModal";
import { DepositModal } from "./DepositModal";
import { WithdrawalModal } from "./WithdrawalModal";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  onViewTransactions: () => void;
  onViewReports: () => void;
}

export function QuickActions({ onViewTransactions, onViewReports }: QuickActionsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [calculatingInterest, setCalculatingInterest] = useState(false);

  const handleCalculateInterest = async () => {
    setCalculatingInterest(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-daily-interest');
      
      if (error) {
        toast({
          title: "Klaida",
          description: "Nepavyko apskaičiuoti palūkanų",
          variant: "destructive"
        });
        return;
      }

      const result = data;
      toast({
        title: "Palūkanos apskaičiuotos",
        description: `Apdorota ${result.accounts_processed} sąskaitų, pridėta ${result.total_interest_paid?.toFixed(2)} LT palūkanų`,
      });
    } catch (error) {
      console.error('Interest calculation error:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko apskaičiuoti palūkanų",
        variant: "destructive"
      });
    } finally {
      setCalculatingInterest(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={() => setTransferModalOpen(true)}
              className="flex items-center gap-2 h-12"
            >
              <Send className="w-4 h-4" />
              {t('quickActions.transfer')}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => setDepositModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {t('quickActions.deposit')}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => setWithdrawalModalOpen(true)}
            >
              <Minus className="w-4 h-4 text-red-500" />
              {t('quickActions.withdraw')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewTransactions}
              className="flex items-center gap-2 h-12"
            >
              <Download className="w-4 h-4" />
              {t('quickActions.history')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onViewReports}
              className="flex items-center gap-2 h-12"
            >
              <BarChart3 className="w-4 h-4" />
              {t('quickActions.reports')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCalculateInterest}
              disabled={calculatingInterest}
              className="flex items-center gap-2 h-12 col-span-3"
            >
              <Calculator className="w-4 h-4" />
              {calculatingInterest ? "Skaičiuojama..." : "Apskaičiuoti dienos palūkanas"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <TransferModal 
        open={transferModalOpen} 
        onOpenChange={setTransferModalOpen}
      />
      
      <DepositModal 
        open={depositModalOpen} 
        onOpenChange={setDepositModalOpen}
      />
      
      <WithdrawalModal 
        open={withdrawalModalOpen} 
        onOpenChange={setWithdrawalModalOpen}
      />
    </>
  );
}