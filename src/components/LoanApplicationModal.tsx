import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatedData: {
    loanAmount: number;
    loanTerm: number;
    monthlyPayment: number;
    totalPayment: number;
    interestRate: number;
  };
}

export const LoanApplicationModal = ({ open, onOpenChange, calculatedData }: LoanApplicationModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    monthlyIncome: "",
    employmentInfo: "",
    loanPurpose: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create payment session for loan application
      const { data, error } = await supabase.functions.invoke('create-loan-payment', {
        body: {
          loanAmount: calculatedData.loanAmount,
          loanTerm: calculatedData.loanTerm,
          ...formData,
          ...calculatedData
        }
      });

      if (error) throw error;

      // Store form data in localStorage for after payment
      localStorage.setItem('loanApplicationData', JSON.stringify({
        formData,
        calculatedData,
        sessionId: data.sessionId
      }));

      // Redirect to Stripe payment
      window.open(data.url, '_blank');
      
      toast({
        title: "Nukreipiama į mokėjimą",
        description: "Mokėjimo suma: 10€. Po sėkmingo mokėjimo paraiška bus automatiškai pateikta.",
      });

      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti mokėjimo. Pabandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="w-6 h-6 text-blue-600" />
            Paraiška paskolai
          </DialogTitle>
          <DialogDescription>
            Užpildykite formą ir gaukite sprendimą per 24 valandas
          </DialogDescription>
        </DialogHeader>

        {/* Loan Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Paskolos parametrai</h3>
              <Badge variant="secondary">{calculatedData.interestRate}% metinė palūkanų norma</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Suma</p>
                <p className="font-semibold">{calculatedData.loanAmount.toLocaleString('lt-LT')} €</p>
              </div>
              <div>
                <p className="text-slate-600">Terminas</p>
                <p className="font-semibold">{calculatedData.loanTerm} mėn.</p>
              </div>
              <div>
                <p className="text-slate-600">Mėnesinis mokėjimas</p>
                <p className="font-semibold text-blue-600">
                  {calculatedData.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <div>
                <p className="text-slate-600">Bendra suma</p>
                <p className="font-semibold">
                  {calculatedData.totalPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Asmens duomenys</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vardas, pavardė *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Jūsų vardas ir pavardė"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">El. pašto adresas *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="jusu@elpastas.lt"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono numeris</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+370 600 00000"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Finansinė informacija</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Mėnesinės pajamos (€)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="2000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentInfo">Darbo vieta</Label>
                <Input
                  id="employmentInfo"
                  type="text"
                  value={formData.employmentInfo}
                  onChange={(e) => handleInputChange('employmentInfo', e.target.value)}
                  placeholder="UAB Pavyzdys"
                />
              </div>
            </div>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Paskolos paskirtis</h3>
            <div className="space-y-2">
              <Label htmlFor="loanPurpose">Kam reikalinga paskola?</Label>
              <Textarea
                id="loanPurpose"
                value={formData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                placeholder="Trumpai aprašykite, kam planuojate panaudoti paskolą"
                rows={3}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Sutinku su sąlygomis:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>10€ mokestis už paraiškos pateikimą</li>
                  <li>14% metinė palūkanų norma be paslėptų mokesčių</li>
                  <li>Sprendimas per 24 valandas</li>
                  <li>Duomenų tvarkymas pagal privatumo politiką</li>
                  <li>Susisiekimas dėl papildomos informacijos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.email}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Pateikiama paraiška...
              </>
            ) : (
              'Pateikti paraišką'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};