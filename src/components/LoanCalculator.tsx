import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calculator, CreditCard, TrendingUp } from "lucide-react";
import { LoanApplicationModal } from "./LoanApplicationModal";

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(24);
  const [modalOpen, setModalOpen] = useState(false);

  const interestRate = 14; // 14% annual interest rate
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment using loan formula
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                        (Math.pow(1 + monthlyRate, loanTerm) - 1);
  
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

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
            Paskolos skaičiuoklė
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Sužinokite savo mėnesinio mokėjimo dydį su <Badge variant="secondary" className="mx-1">14% metine palūkanų norma</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loan Amount */}
          <div className="space-y-3">
            <Label htmlFor="loanAmount" className="text-base font-medium text-slate-700">
              Paskolos suma: {loanAmount.toLocaleString('lt-LT')} €
            </Label>
            <Slider
              id="loanAmount"
              min={1000}
              max={50000}
              step={500}
              value={[loanAmount]}
              onValueChange={(value) => setLoanAmount(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500">
              <span>1,000 €</span>
              <span>50,000 €</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-3">
            <Label htmlFor="loanTerm" className="text-base font-medium text-slate-700">
              Paskolos terminas: {loanTerm} mėn.
            </Label>
            <Slider
              id="loanTerm"
              min={6}
              max={60}
              step={1}
              value={[loanTerm]}
              onValueChange={(value) => setLoanTerm(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-500">
              <span>6 mėn.</span>
              <span>60 mėn.</span>
            </div>
          </div>

          {/* Alternative Input Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountInput" className="text-sm font-medium text-slate-700">
                Tiksli suma (€)
              </Label>
              <Input
                id="amountInput"
                type="number"
                min="1000"
                max="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termInput" className="text-sm font-medium text-slate-700">
                Tikslus terminas (mėn.)
              </Label>
              <Input
                id="termInput"
                type="number"
                min="6"
                max="60"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Mėnesinis mokėjimas</h3>
            <p className="text-2xl font-bold text-blue-600">
              {monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Bendra suma</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Palūkanos</h3>
            <p className="text-2xl font-bold text-orange-600">
              {totalInterest.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Button */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/80 to-green-50/80">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">
            Patenkino skaičiavimas?
          </h3>
          <p className="text-slate-600 mb-6">
            Pateikite paraišką paskolai ir gaukite sprendimą per 24 valandas
          </p>
          <Button 
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold"
          >
            Pateikti paraišką paskolai
          </Button>
        </CardContent>
      </Card>

      <LoanApplicationModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        calculatedData={{
          loanAmount,
          loanTerm,
          monthlyPayment,
          totalPayment,
          interestRate
        }}
      />
    </div>
  );
};

export default LoanCalculator;