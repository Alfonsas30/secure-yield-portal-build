import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, TrendingUp, Calculator } from "lucide-react";
import { LoanCalculation } from "./types";

interface LoanResultsProps {
  calculations: LoanCalculation;
  validLoanTerm: number;
}

export const LoanResults = ({ calculations, validLoanTerm }: LoanResultsProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
        <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 lg:mb-4 text-slate-900 uppercase tracking-wide">{t('loanResults.monthlyPayment')}</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-blue-600 mb-3 lg:mb-4 drop-shadow-lg">
            {calculations.monthlyPayment > 0 
              ? `${calculations.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
              : t('loanResults.calculating')}
          </p>
          <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium">
            {calculations.monthlyPayment > 0 
              ? t('loanResults.monthlyPaymentNote', { termMonths: validLoanTerm })
              : t('loanResults.checkInputs')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-semibold mb-2 text-slate-900">{t('loanResults.totalAmount')}</h3>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {calculations.totalPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-semibold mb-2 text-slate-900">{t('loanResults.interestAmount')}</h3>
          <p className="text-xl md:text-2xl font-bold text-orange-600">
            {calculations.totalInterest.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
        </CardContent>
      </Card>
    </div>
  );
};