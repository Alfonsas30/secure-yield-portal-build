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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert into database
      const { error: dbError } = await supabase
        .from('loan_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          monthly_income: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
          employment_info: formData.employmentInfo,
          loan_purpose: formData.loanPurpose,
          loan_amount: calculatedData.loanAmount,
          loan_term_months: calculatedData.loanTerm,
          monthly_payment: calculatedData.monthlyPayment,
          total_payment: calculatedData.totalPayment,
          interest_rate: calculatedData.interestRate
        });

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('submit-loan-application', {
        body: {
          ...formData,
          ...calculatedData
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw here - application is saved, email failure is secondary
      }

      toast({
        title: t('modals.loan.success'),
        description: t('modals.loan.successDescription'),
      });

      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        monthlyIncome: "",
        employmentInfo: "",
        loanPurpose: ""
      });

    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: t('forms.error'),
        description: t('modals.loan.submitError'),
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
            {t('modals.loan.title')}
          </DialogTitle>
          <DialogDescription>
            {t('modals.loan.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Loan Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{t('modals.loan.summary.title')}</h3>
              <Badge variant="secondary">{calculatedData.interestRate}% metinė palūkanų norma</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">{t('modals.loan.summary.amount')}</p>
                <p className="font-semibold">{calculatedData.loanAmount.toLocaleString('lt-LT')} €</p>
              </div>
              <div>
                <p className="text-slate-600">{t('modals.loan.summary.term')}</p>
                <p className="font-semibold">{calculatedData.loanTerm} {t('modals.loan.summary.months')}</p>
              </div>
              <div>
                <p className="text-slate-600">{t('modals.loan.summary.monthlyPayment')}</p>
                <p className="font-semibold text-blue-600">
                  {calculatedData.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <div>
                <p className="text-slate-600">{t('modals.loan.summary.totalPayment')}</p>
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
            <h3 className="text-lg font-semibold text-slate-900">{t('modals.loan.personal.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('modals.loan.personal.name')} {t('forms.required')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder={t('modals.loan.personal.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('modals.loan.personal.email')} {t('forms.required')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder={t('modals.loan.personal.emailPlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('modals.loan.personal.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('modals.loan.personal.phonePlaceholder')}
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('modals.loan.financial.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">{t('modals.loan.financial.monthlyIncome')}</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder={t('modals.loan.financial.incomePlaceholder')}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentInfo">{t('modals.loan.financial.employment')}</Label>
                <Input
                  id="employmentInfo"
                  type="text"
                  value={formData.employmentInfo}
                  onChange={(e) => handleInputChange('employmentInfo', e.target.value)}
                  placeholder={t('modals.loan.financial.employmentPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('modals.loan.purpose.title')}</h3>
            <div className="space-y-2">
              <Label htmlFor="loanPurpose">{t('modals.loan.purpose.label')}</Label>
              <Textarea
                id="loanPurpose"
                value={formData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                placeholder={t('modals.loan.purpose.placeholder')}
                rows={3}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">{t('modals.loan.terms.title')}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {(() => {
                    const items = t('modals.loan.terms.items');
                    if (Array.isArray(items)) {
                      return items.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ));
                    }
                    return <li>{items}</li>;
                  })()}
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
                {t('modals.loan.submitting')}
              </>
            ) : (
              t('modals.loan.submit')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};