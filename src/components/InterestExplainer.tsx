import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InterestExplainer() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Kaip veikia palūkanų skaičiavimas?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Svarbu:</strong> Mūsų sistema naudoja tikslų 2% metinį palūkanų skaičiavimą, kuris gali skirtis nuo supaprastintų skaičiavimų.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold">Pagrindiniai principai:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 mt-0.5 text-green-600" />
              <span><strong>Metinė palūkanų norma:</strong> 2% (fiksuota)</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 mt-0.5 text-blue-600" />
              <span><strong>Dienos palūkanų norma:</strong> 2% ÷ 365 = 0.00547945% per dieną</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 mt-0.5 text-purple-600" />
              <span><strong>Skaičiavimas:</strong> Balansas × 0.00547945% = dienos palūkanos</span>
            </li>
          </ul>
        </div>

        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? 'Paslėpti' : 'Rodyti'} detalizuotą pavyzdį
        </Button>

        {showDetails && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold">Pavyzdys su 100 LT balansu:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h5 className="font-medium text-green-600">Tikslus skaičiavimas:</h5>
                <ul className="space-y-1">
                  <li>• Dienos palūkanos: 100 × 0.00547945% = 0.00547945 LT</li>
                  <li>• Po 1 dienos: 100.00547945 LT</li>
                  <li>• Po 2 dienų: 100.01095890 LT</li>
                  <li>• Apvalinta (2 skaičiai): 100.01 LT</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-orange-600">Supaprastintas skaičiavimas:</h5>
                <ul className="space-y-1">
                  <li>• Žmonės tikisi: 100 × 0.01% = 0.01 LT/dieną</li>
                  <li>• Po 1 dienos: 100.01 LT</li>
                  <li>• Po 2 dienų: 100.02 LT</li>
                  <li>• <strong className="text-red-600">Neteisinga!</strong> (per didelės palūkanos)</li>
                </ul>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Išvada:</strong> Tikrasis palūkanų skaičiavimas yra tikslus ir atitinka 2% metinę normą. 
                Jei tikitės didesnių dienos palūkanų, tai reiškia, kad suprantate palūkanų skaičiavimą kaip 
                supaprastintą 0.01% per dieną, tačiau tai nebūtų tikra 2% metinė norma.
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-blue-800 mb-2">Kodėl 100 LT turi būti 100.01 LT po 2 dienų, o ne 100.02 LT?</h5>
              <p className="text-sm text-blue-700">
                Nes 0.01 LT per dieną iš 100 LT sudarytų 3.65 LT per metus (0.01 × 365), 
                o tai būtų 3.65% metinė norma, ne 2%. Tikroji dienos norma yra mažesnė: 0.00547945 LT.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}