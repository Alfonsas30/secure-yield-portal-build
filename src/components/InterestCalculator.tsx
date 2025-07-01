
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp } from "lucide-react";

const InterestCalculator = () => {
  const [amount, setAmount] = useState<string>("10000");
  const [rate] = useState<number>(8); // 8% per year
  
  const calculateInterest = () => {
    const principal = parseFloat(amount) || 0;
    const dailyRate = rate / 365 / 100;
    const dailyInterest = principal * dailyRate;
    const monthlyInterest = dailyInterest * 30;
    const yearlyInterest = principal * (rate / 100);
    
    return {
      daily: dailyInterest,
      monthly: monthlyInterest,
      yearly: yearlyInterest
    };
  };

  const interest = calculateInterest();

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <Calculator className="w-4 h-4 mr-2" />
            Palūkanų skaičiuoklė
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Apskaičiuokite savo pelną
          </h2>
          <p className="text-xl text-slate-600">
            Sužinokite, kiek uždirbsite su mūsų dienos palūkanomis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Įveskite sumą
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="amount" className="text-base font-medium text-slate-700">
                  Taupoma suma (€)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 text-xl py-4 border-2 focus:border-blue-500"
                  placeholder="10000"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Palūkanų norma:</span>
                  <Badge className="bg-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {rate}% per metus
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Jūsų pelnas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Per dieną</div>
                  <div className="text-2xl font-bold">
                    +{interest.daily.toFixed(2)} €
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Per mėnesį</div>
                  <div className="text-2xl font-bold">
                    +{interest.monthly.toFixed(2)} €
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-sm opacity-90">Per metus</div>
                  <div className="text-3xl font-bold">
                    +{interest.yearly.toFixed(2)} €
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-white text-blue-600 hover:bg-slate-50 font-semibold py-3"
                size="lg"
              >
                Pradėti taupyti
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InterestCalculator;
