import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, Loader2, LogIn, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LoanApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAuthModal?: () => void;
  calculatedData: {
    loanAmount: number;
    loanTerm: number;
    monthlyPayment: number;
    totalPayment: number;
    interestRate: number;
  };
}

export const LoanApplicationModal = ({ open, onOpenChange, onOpenAuthModal, calculatedData }: LoanApplicationModalProps) => {
  const { t } = useTranslation();
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
  const { user } = useAuth();

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
        title: t('loanApplication.toast.redirecting'),
        description: t('loanApplication.toast.redirectingDescription'),
      });

      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: t('loanApplication.toast.error'),
        description: t('loanApplication.toast.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-center">
              <Shield className="w-6 h-6 text-amber-600" />
              {t('loanApplication.loginRequired.title')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('loanApplication.loginRequired.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-slate-900 mb-2">{t('loanApplication.loginRequired.whyLogin')}</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {t('loanApplication.loginRequired.reasons.0')}</li>
                  <li>• {t('loanApplication.loginRequired.reasons.1')}</li>
                  <li>• {t('loanApplication.loginRequired.reasons.2')}</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                {t('loanApplication.loginRequired.cancelButton')}
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onOpenAuthModal?.();
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('loanApplication.loginRequired.loginButton')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="w-6 h-6 text-blue-600" />
            {t('loanApplication.title')}
          </DialogTitle>
          <DialogDescription>
            {t('loanApplication.description')}
            <br />
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 mt-2">
              {t('loanApplication.applicationFee')}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {/* Loan Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{t('loanApplication.loanSummary.title')}</h3>
              <Badge variant="secondary">{calculatedData.interestRate}% {t('loanApplication.loanSummary.annualRate')}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">{t('loanApplication.loanSummary.amount')}</p>
                <p className="font-semibold">{calculatedData.loanAmount.toLocaleString('lt-LT')} LT</p>
              </div>
              <div>
                <p className="text-slate-600">{t('loanApplication.loanSummary.term')}</p>
                <p className="font-semibold">{calculatedData.loanTerm} {t('loanApplication.loanSummary.months')}</p>
              </div>
              <div>
                <p className="text-slate-600">{t('loanApplication.loanSummary.monthlyPayment')}</p>
                <p className="font-semibold text-blue-600">
                  {calculatedData.monthlyPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LT
                </p>
              </div>
              <div>
                <p className="text-slate-600">{t('loanApplication.loanSummary.totalAmount')}</p>
                <p className="font-semibold">
                  {calculatedData.totalPayment.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('loanApplication.personalInfo.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('loanApplication.personalInfo.nameLabel')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder={t('loanApplication.personalInfo.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('loanApplication.personalInfo.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder={t('loanApplication.personalInfo.emailPlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('loanApplication.personalInfo.phoneLabel')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('loanApplication.personalInfo.phonePlaceholder')}
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('loanApplication.financialInfo.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">{t('loanApplication.financialInfo.incomeLabel')}</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder={t('loanApplication.financialInfo.incomePlaceholder')}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentInfo">{t('loanApplication.financialInfo.employmentLabel')}</Label>
                <Input
                  id="employmentInfo"
                  type="text"
                  value={formData.employmentInfo}
                  onChange={(e) => handleInputChange('employmentInfo', e.target.value)}
                  placeholder={t('loanApplication.financialInfo.employmentPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('loanApplication.loanPurpose.title')}</h3>
            <div className="space-y-2">
              <Label htmlFor="loanPurpose">{t('loanApplication.loanPurpose.label')}</Label>
              <Textarea
                id="loanPurpose"
                value={formData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                placeholder={t('loanApplication.loanPurpose.placeholder')}
                rows={3}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">{t('loanApplication.terms.title')}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>• {t('loanApplication.terms.applicationFee')}</li>
                  <li>• {t('loanApplication.terms.interestRate')}</li>
                  <li>• {t('loanApplication.terms.decision')}</li>
                  <li>• {t('loanApplication.terms.dataProcessing')}</li>
                  <li>• {t('loanApplication.terms.contact')}</li>
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
                {t('loanApplication.buttons.submitting')}
              </>
            ) : (
              t('loanApplication.buttons.submit')
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};