import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoanData } from "./types";

interface LoanApplicationCTAProps {
  onOpenModal: () => void;
  calculatedData: LoanData;
}

export const LoanApplicationCTA = ({ onOpenModal, calculatedData }: LoanApplicationCTAProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/80 to-green-50/80">
      <CardContent className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">
          {t('loans.application.title')}
        </h3>
        <p className="text-slate-600 mb-6">
          {t('loans.application.subtitle')}
        </p>
        <Button 
          onClick={onOpenModal}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          {t('loans.application.button')}
        </Button>
      </CardContent>
    </Card>
  );
};