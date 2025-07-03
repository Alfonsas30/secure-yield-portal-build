import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { LoanApplicationModal } from "./LoanApplicationModal";
import { AuthModal } from "./auth/AuthModal";
import { useLoanCalculations } from "@/hooks/useLoanCalculations";
import { LoanInputs } from "./loan/LoanInputs";
import { LoanResults } from "./loan/LoanResults";
import { PaymentSchedule } from "./loan/PaymentSchedule";
import { LoanApplicationCTA } from "./loan/LoanApplicationCTA";

const LoanCalculator = () => {
  const { t } = useTranslation();
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(24);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Validate and sanitize inputs
  const validLoanAmount = useMemo(() => {
    const amount = Number(loanAmount);
    return isNaN(amount) || amount < 1000 ? 1000 : amount > 50000 ? 50000 : amount;
  }, [loanAmount]);

  const validLoanTerm = useMemo(() => {
    const term = Number(loanTerm);
    return isNaN(term) || term < 6 ? 6 : term > 60 ? 60 : term;
  }, [loanTerm]);

  const calculations = useLoanCalculations(validLoanAmount, validLoanTerm);

  const handleAmountChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(numValue)) {
      setLoanAmount(numValue);
    }
  };

  const handleTermChange = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!isNaN(numValue)) {
      setLoanTerm(numValue);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {t('loanCalculator.title')}
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            {t('loanCalculator.description')} <Badge variant="secondary" className="mx-1">{t('loanCalculator.annualRate')}</Badge>
            <br />
            <span className="text-sm text-slate-500 mt-2 block">
              💡 {t('loanCalculator.applicationFee')} <Badge variant="outline" className="text-orange-600 border-orange-200">10 LT</Badge>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoanInputs
            loanAmount={loanAmount}
            loanTerm={loanTerm}
            onAmountChange={handleAmountChange}
            onTermChange={handleTermChange}
          />
        </CardContent>
      </Card>

      <LoanResults calculations={calculations} validLoanTerm={validLoanTerm} />

      <PaymentSchedule calculations={calculations} />

      <LoanApplicationCTA
        onOpenModal={() => setModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <LoanApplicationModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        calculatedData={{
          loanAmount: validLoanAmount,
          loanTerm: validLoanTerm,
          monthlyPayment: calculations.monthlyPayment,
          totalPayment: calculations.totalPayment,
          interestRate: calculations.interestRate
        }}
      />

      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab="login"
      />
    </div>
  );
};

export default LoanCalculator;