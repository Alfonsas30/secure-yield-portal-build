import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Plus, Download, BarChart3, Calculator, Minus, Clock, CheckCircle } from "lucide-react";
import { TransferModal } from "./TransferModal";
import { DepositModal } from "./DepositModal";
import { WithdrawalModal } from "./WithdrawalModal";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/hooks/useAdminRole";

interface QuickActionsProps {
  onViewTransactions: () => void;
  onViewReports: () => void;
}

export function QuickActions({ onViewTransactions, onViewReports }: QuickActionsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useAdminRole();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [calculatingInterest, setCalculatingInterest] = useState(false);
  const [interestStatus, setInterestStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check interest calculation status on component mount
  useEffect(() => {
    checkInterestStatus();
  }, []);

  const checkInterestStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.rpc('check_daily_interest_status');
      if (!error) {
        setInterestStatus(data);
      }
    } catch (error) {
      console.error('Error checking interest status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCalculateInterest = async () => {
    // Check if user is admin
    if (!isAdmin) {
      toast({
        title: "Prieiga uždrausta",
        description: "Tik administratoriai gali rankiniu būdu skaičiuoti palūkanas",
        variant: "destructive"
      });
      return;
    }

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
      
      if (!result.success) {
        toast({
          title: "Palūkanos jau apskaičiuotos",
          description: result.error || "Šiandien palūkanos jau buvo apskaičiuotos",
          variant: "destructive"
        });
        // Refresh status
        await checkInterestStatus();
        return;
      }

      toast({
        title: "Palūkanos apskaičiuotos",
        description: `Apdorota ${result.accounts_processed} sąskaitų, pridėta ${result.total_interest_paid?.toFixed(2)} LT palūkanų`,
      });
      
      // Refresh status after successful calculation
      await checkInterestStatus();
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
            
            {/* Interest calculation button */}
            {interestStatus?.calculated_today ? (
              <div className="col-span-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Šiandien palūkanos jau apskaičiuotos</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Apdorota: {interestStatus.accounts_processed} sąskaitų | 
                  Pridėta: {interestStatus.total_interest_paid?.toFixed(2)} LT | 
                  Laikas: {new Date(interestStatus.calculated_at).toLocaleTimeString('lt-LT')}
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleCalculateInterest}
                disabled={calculatingInterest || checkingStatus || !isAdmin}
                className="flex items-center gap-2 h-12 col-span-3"
              >
                {calculatingInterest ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Skaičiuojama...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    {isAdmin ? "Apskaičiuoti dienos palūkanas" : "Palūkanų skaičiavimas (tik admin)"}
                  </>
                )}
              </Button>
            )}
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