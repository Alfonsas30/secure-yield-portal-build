import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Building, Percent, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestDiscount: () => void;
}

export function RegistrationModal({ open, onOpenChange, onRequestDiscount }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "personal" as "personal" | "company",
    discountCode: ""
  });
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean;
    discount_percent: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const { toast } = useToast();

  const prices = {
    personal: 800,
    company: 1500
  };

  const originalPrice = prices[formData.accountType];
  const discountAmount = discountInfo?.valid ? (originalPrice * discountInfo.discount_percent / 100) : 0;
  const finalPrice = originalPrice - discountAmount;

  const validateDiscountCode = async () => {
    if (!formData.discountCode.trim() || !formData.email.trim()) {
      toast({
        title: "Klaida",
        description: "Įveskite el. paštą ir nuolaidos kodą",
        variant: "destructive"
      });
      return;
    }

    setValidatingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: {
          code: formData.discountCode.trim(),
          email: formData.email.trim()
        }
      });

      if (error) throw error;

      setDiscountInfo(data);
      toast({
        title: data.valid ? "Sėkmė" : "Perspėjimas",
        description: data.message,
        variant: data.valid ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko patikrinti nuolaidos kodo",
        variant: "destructive"
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handlePayment = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Klaida",
        description: "Užpildykite visus privalomatus laukus",
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
          discount_code: discountInfo?.valid ? formData.discountCode.trim() : undefined
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">
            Registracija
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Type Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Sąskaitos tipas
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
                    <div className="font-medium">Asmeninė</div>
                    <div className="text-sm text-muted-foreground">800 €</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                  <Building className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Įmonės</div>
                    <div className="text-sm text-muted-foreground">1500 €</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Vardas Pavardė *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Įveskite vardą ir pavardę"
              />
            </div>
            <div>
              <Label htmlFor="email">El. paštas *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="vardas@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono numeris</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+370..."
              />
            </div>
          </div>

          {/* Discount Code */}
          <div className="space-y-3">
            <Label htmlFor="discountCode">Nuolaidos kodas</Label>
            <div className="flex gap-2">
              <Input
                id="discountCode"
                value={formData.discountCode}
                onChange={(e) => setFormData(prev => ({ ...prev, discountCode: e.target.value.toUpperCase() }))}
                placeholder="ABCD1234"
                maxLength={8}
              />
              <Button
                variant="outline"
                onClick={validateDiscountCode}
                disabled={validatingCode || !formData.discountCode.trim() || !formData.email.trim()}
              >
                {validatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Percent className="w-4 h-4" />}
              </Button>
            </div>
            
            {discountInfo && (
              <div className={`text-sm p-2 rounded ${discountInfo.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {discountInfo.message}
              </div>
            )}

            <Button
              variant="ghost"
              className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
              onClick={() => {
                onOpenChange(false);
                onRequestDiscount();
              }}
            >
              Neturite nuolaidos kodo? Prašykite čia →
            </Button>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pradinė kaina:</span>
              <span>{originalPrice} €</span>
            </div>
            {discountInfo?.valid && (
              <div className="flex justify-between text-green-600">
                <span>Nuolaida ({discountInfo.discount_percent}%):</span>
                <span>-{discountAmount} €</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Galutinė kaina:</span>
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
            Mokėti su Stripe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}