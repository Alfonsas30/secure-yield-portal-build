import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Building, Percent, CreditCard, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationModal({ open, onOpenChange }: RegistrationModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "personal" as "personal" | "company",
    discountCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    discount_percent?: number;
    message: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const { toast } = useToast();

  // Campaign end date: 2025-09-01
  const campaignEndDate = new Date('2025-09-01T00:00:00');
  const isCampaignActive = new Date() < campaignEndDate;

  // Update countdown timer
  useEffect(() => {
    if (!isCampaignActive) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = campaignEndDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isCampaignActive]);

  const prices = {
    personal: 800,
    company: 1500
  };

  // Calculate discounts
  const originalPrice = prices[formData.accountType];
  let campaignDiscount = isCampaignActive ? 50 : 0;
  let additionalDiscount = discountValidation?.valid ? discountValidation.discount_percent || 0 : 0;
  let totalDiscount = Math.min(100, campaignDiscount + additionalDiscount);
  let finalPrice = Math.round(originalPrice * (1 - totalDiscount / 100));

  // Validate discount code
  const validateDiscountCode = async (code: string, email: string) => {
    if (!code.trim() || !email.trim()) {
      setDiscountValidation(null);
      return;
    }

    setDiscountValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: code.trim(), email: email.trim() }
      });

      if (error) throw error;
      setDiscountValidation(data);
    } catch (error) {
      console.error("Error validating discount code:", error);
      setDiscountValidation({
        valid: false,
        message: "Klaida tikrinant nuolaidų kodą"
      });
    } finally {
      setDiscountValidating(false);
    }
  };

  // Debounced discount validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.discountCode && formData.email) {
        validateDiscountCode(formData.discountCode, formData.email);
      } else {
        setDiscountValidation(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.discountCode, formData.email]);

  const handlePayment = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: t('registrationModal.error'),
        description: t('registrationModal.fillRequiredFields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-registration-payment', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          account_type: formData.accountType,
          discount_code: formData.discountCode || undefined,
          campaign_active: isCampaignActive,
          campaign_discount: isCampaignActive ? 50 : 0
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti mokėjimo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {t('registrationModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campaign Banner */}
          {isCampaignActive && (
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-base">{t('registrationModal.campaign')}</span>
              </div>
              <div className="text-sm opacity-90">
                {t('registrationModal.campaignDescription')}
              </div>
              {timeLeft && (
                <div className="text-sm font-medium mt-1">
                  {t('registrationModal.timeLeft')} {timeLeft}
                </div>
              )}
            </div>
          )}

          {/* Account Type Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              {t('registrationModal.accountType')}
            </Label>
            <RadioGroup
              value={formData.accountType}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                accountType: value as "personal" | "company"
              }))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{t('registrationModal.personal')}</div>
                    <div className="text-sm text-muted-foreground">
                      {isCampaignActive ? (
                        <>
                          <span className="line-through text-gray-400">800 €</span>
                          <span className="ml-2 text-green-600 font-semibold">400 €</span>
                        </>
                      ) : (
                        "800 €"
                      )}
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                  <Building className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{t('registrationModal.company')}</div>
                    <div className="text-sm text-muted-foreground">
                      {isCampaignActive ? (
                        <>
                          <span className="line-through text-gray-400">1500 €</span>
                          <span className="ml-2 text-green-600 font-semibold">750 €</span>
                        </>
                      ) : (
                        "1500 €"
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('registrationModal.fullName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('registrationModal.fullNamePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="email">{t('registrationModal.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t('registrationModal.emailPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('registrationModal.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder={t('registrationModal.phonePlaceholder')}
              />
            </div>
            
            {/* Discount Code */}
            <div>
              <Label htmlFor="discountCode">
                {t('registrationModal.discountCode', 'Nuolaidų kodas')} 
                <span className="text-sm text-muted-foreground ml-1">(neprivaloma)</span>
              </Label>
              <div className="relative">
                <Input
                  id="discountCode"
                  value={formData.discountCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountCode: e.target.value.toUpperCase() }))}
                  placeholder={t('registrationModal.discountCodePlaceholder', 'Įveskite nuolaidų kodą')}
                  className={`pr-10 ${
                    discountValidation?.valid ? 'border-green-500' : 
                    discountValidation && !discountValidation.valid ? 'border-red-500' : ''
                  }`}
                />
                {discountValidating && (
                  <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!discountValidating && discountValidation?.valid && (
                  <Check className="absolute right-3 top-3 w-4 h-4 text-green-600" />
                )}
                {!discountValidating && discountValidation && !discountValidation.valid && (
                  <X className="absolute right-3 top-3 w-4 h-4 text-red-600" />
                )}
              </div>
              {discountValidation && (
                <p className={`text-sm mt-1 ${
                  discountValidation.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {discountValidation.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('registrationModal.initialPrice')}</span>
              <span>{originalPrice} €</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t('registrationModal.discount')} ({totalDiscount}%):</span>
                <span>-{(originalPrice - finalPrice).toFixed(0)} €</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>{t('registrationModal.finalPrice')}</span>
              <span>{finalPrice} €</span>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading || !formData.name.trim() || !formData.email.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            {t('registrationModal.payWithStripe')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}