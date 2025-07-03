import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Building, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiscountRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountRequestModal({ open, onOpenChange }: DiscountRequestModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountType: "personal" as "personal" | "company"
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: t('discount.error'),
        description: t('discount.fillAllFields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call Resend edge function (handles both DB save and email sending)
      const { error } = await supabase.functions.invoke('request-discount', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          account_type: formData.accountType
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error("Nepavyko išsiųsti užklausos");
      }

      toast({
        title: t('discount.success'),
        description: t('discount.successDescription'),
      });

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        accountType: "personal"
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error details:", error);
      
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko išsiųsti užklausos. Bandykite dar kartą.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            {t('discount.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center text-muted-foreground text-sm">
            {t('discount.description')}
          </div>

          {/* Account Type Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              {t('discount.accountType')}
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
                <RadioGroupItem value="personal" id="discount-personal" />
                <Label htmlFor="discount-personal" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{t('discount.personal')}</div>
                    <div className="text-sm text-muted-foreground">800 € → 400 €</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="company" id="discount-company" />
                <Label htmlFor="discount-company" className="flex items-center gap-2 cursor-pointer">
                  <Building className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{t('discount.company')}</div>
                    <div className="text-sm text-muted-foreground">1500 € → 750 €</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="discount-name">{t('discount.nameLabel')}</Label>
              <Input
                id="discount-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Įveskite vardą ir pavardę"
              />
            </div>
            <div>
              <Label htmlFor="discount-email">{t('discount.emailLabel')}</Label>
              <Input
                id="discount-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="vardas@example.com"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <Mail className="w-4 h-4" />
              <span className="font-medium">{t('discount.howItWorks')}</span>
            </div>
            <ul className="text-blue-600 text-sm mt-2 space-y-1">
              <li>• Jūsų užklausa bus išsiųsta administratoriui</li>
              <li>• Per 24 val. gausite atsakymą el. paštu</li>
              <li>• Patvirtinus - gausite 50% nuolaidos kodą</li>
              <li>• Kodas galioja 30 dienų</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.email.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {t('discount.sendRequest')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}