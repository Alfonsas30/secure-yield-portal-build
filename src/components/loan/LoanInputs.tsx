import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface LoanInputsProps {
  loanAmount: number;
  loanTerm: number;
  onAmountChange: (value: number | string) => void;
  onTermChange: (value: number | string) => void;
}

export const LoanInputs = ({ loanAmount, loanTerm, onAmountChange, onTermChange }: LoanInputsProps) => {
  return (
    <div className="space-y-6">
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
          onValueChange={(value) => onAmountChange(value[0])}
          className="w-full touch-manipulation"
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
          onValueChange={(value) => onTermChange(value[0])}
          className="w-full touch-manipulation"
        />
        <div className="flex justify-between text-sm text-slate-500">
          <span>6 mėn.</span>
          <span>60 mėn.</span>
        </div>
      </div>

      {/* Alternative Input Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full py-3 text-base min-h-[48px]"
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
            onChange={(e) => onTermChange(e.target.value)}
            className="w-full py-3 text-base min-h-[48px]"
          />
        </div>
      </div>
    </div>
  );
};