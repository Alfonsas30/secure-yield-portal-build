import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";


interface LoanApplicationCTAProps {
  onOpenModal: () => void;
  onOpenAuthModal?: () => void;
}

export const LoanApplicationCTA = ({ onOpenModal, onOpenAuthModal }: LoanApplicationCTAProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/80 to-green-50/80">
      <CardContent className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">
          {user ? t('loanApplicationCTA.satisfiedWithCalculation') : t('loanApplicationCTA.applyForLoan')}
        </h3>
        <p className="text-slate-600 mb-4">
          {user 
            ? t('loanApplicationCTA.applyWithin24h')
            : t('loanApplicationCTA.loginToApply')
          }
        </p>
        <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            {t('loanApplicationCTA.applicationFee')}
          </Badge>
          <span>{t('loanApplicationCTA.feeDetails')}</span>
        </p>
        <Button 
          onClick={user ? onOpenModal : onOpenAuthModal}
          className={user 
            ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold"
          }
        >
          {user ? (
            t('loanApplicationCTA.applyNow')
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              {t('loanApplicationCTA.loginAndApply')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};