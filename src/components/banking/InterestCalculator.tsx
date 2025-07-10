import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function InterestCalculator() {
  const [balance, setBalance] = useState("1000");
  const [period, setPeriod] = useState("month");

  const calculateInterest = (amount: number, days: number) => {
    const annualRate = 0.02; // 2%
    const dailyRate = annualRate / 365;
    return amount * dailyRate * days;
  };

  const getPeriodDays = (period: string) => {
    switch (period) {
      case "day": return 1;
      case "week": return 7;
      case "month": return 30;
      case "quarter": return 90;
      case "year": return 365;
      default: return 30;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "day": return "dieną";
      case "week": return "savaitę";
      case "month": return "mėnesį";
      case "quarter": return "ketvirtį";
      case "year": return "metus";
      default: return "mėnesį";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lt-LT', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount) + ' LT';
  };

  const balanceAmount = parseFloat(balance) || 0;
  const days = getPeriodDays(period);
  const expectedInterest = calculateInterest(balanceAmount, days);
  const effectiveAnnualRate = ((expectedInterest * (365 / days)) / balanceAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Palūkanų skaičiuoklė
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Balansas (LT)</Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Įveskite balansą"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Laikotarpis</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Diena</SelectItem>
                <SelectItem value="week">Savaitė</SelectItem>
                <SelectItem value="month">Mėnuo</SelectItem>
                <SelectItem value="quarter">Ketvirtis</SelectItem>
                <SelectItem value="year">Metai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {balanceAmount > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Palūkanos per {getPeriodLabel(period)}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(expectedInterest)}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Balansas po {getPeriodLabel(period)}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(balanceAmount + expectedInterest)}
                </div>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Efektyvi metinė norma</div>
                <div className="text-2xl font-bold text-purple-600">
                  {effectiveAnnualRate.toFixed(3)}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Palūkanų prognozė</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Diena", days: 1 },
                  { label: "Savaitė", days: 7 },
                  { label: "Mėnuo", days: 30 },
                  { label: "Metai", days: 365 }
                ].map(({ label, days }) => (
                  <div key={label} className="p-3 bg-muted/50 rounded">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-semibold text-sm">
                      +{formatCurrency(calculateInterest(balanceAmount, days))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">Svarbi informacija:</div>
              <ul className="space-y-1 text-xs">
                <li>• Palūkanos skaičiuojamos pagal 2% metinę normą</li>
                <li>• Palūkanos pridedamos kasdien (~0.0055% per dieną)</li>
                <li>• Faktinės palūkanos gali šiek tiek skirtis dėl apvalinimo</li>
                <li>• Skaičiavimas atliekamas automatiškai kiekvieną dieną 00:01</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}