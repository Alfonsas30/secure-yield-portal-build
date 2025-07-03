import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoanData } from "./types";

interface LoanApplicationCTAProps {
  onOpenModal: () => void;
  calculatedData: LoanData;
}

export const LoanApplicationCTA = ({ onOpenModal, calculatedData }: LoanApplicationCTAProps) => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/80 to-green-50/80">
      <CardContent className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-4 text-slate-900">
          Patenkino skaičiavimas?
        </h3>
        <p className="text-slate-600 mb-4">
          Pateikite paraišką paskolai ir gaukite sprendimą per 24 valandas
        </p>
        <p className="text-sm text-slate-500 mb-6 flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            Paraiškos mokestis: 10€
          </Badge>
          <span>• Mokama vienkartinai • Grąžinama jei paskola nepatvirtinta</span>
        </p>
        <Button 
          onClick={onOpenModal}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold"
        >
          Pateikti paraišką paskolai
        </Button>
      </CardContent>
    </Card>
  );
};