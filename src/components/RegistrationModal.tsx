import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Building, Percent, CreditCard, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationModal({ open, onOpenChange }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "personal" as "personal" | "company"
  });
  const [loading, setLoading] = useState(false);
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

  const originalPrice = prices[formData.accountType];
  
  // Apply automatic 50% campaign discount if active
  const totalDiscount = isCampaignActive ? 50 : 0;
  const discountAmount = (originalPrice * totalDiscount / 100);
  const finalPrice = originalPrice - discountAmount;

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
          account_type: formData.accountType
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
          {/* Campaign Banner */}
          {isCampaignActive && (
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">AKCIJA 50% NUOLAIDA!</span>
              </div>
              <div className="text-sm opacity-90">
                Naujiems klientams iki 2025-09-01
              </div>
              {timeLeft && (
                <div className="text-sm font-medium mt-1">
                  Liko: {timeLeft}
                </div>
              )}
            </div>
          )}

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
                    <div className="font-medium">Įmonės</div>
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

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pradinė kaina:</span>
              <span>{originalPrice} €</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Nuolaida ({totalDiscount}%):</span>
                <span>-{discountAmount.toFixed(0)} €</span>
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