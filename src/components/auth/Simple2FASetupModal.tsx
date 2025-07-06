import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Smartphone, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOTPSetupModal } from "./TOTPSetupModal";

interface Simple2FASetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: () => void;
}

export function Simple2FASetupModal({ open, onOpenChange, onSetupComplete }: Simple2FASetupModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("totp");
  const [totpModalOpen, setTotpModalOpen] = useState(false);

  const setupEmailAuth = async () => {
    setLoading(true);
    console.log('🔧 Setting up Email 2FA');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email-2fa', {
        body: { action: 'setup' }
      });

      console.log('🔧 Email setup response:', { data, error });

      if (error) {
        console.error('🚨 Email setup error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Email 2FA setup successful');
        toast({
          title: "Email 2FA sukonfigūruotas",
          description: "Email 2FA sėkmingai įjungtas jūsų paskyroje",
        });
        
        onSetupComplete();
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'Email 2FA konfigūracija nepavyko');
      }
    } catch (error: any) {
      console.error('🚨 Email setup error:', error);
      const errorMessage = error?.message || error?.details || "Nepavyko nustatyti Email 2FA";
      toast({
        title: t('discount.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPSetup = () => {
    setTotpModalOpen(true);
  };

  const handleTOTPComplete = () => {
    setTotpModalOpen(false);
    onSetupComplete();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-primary" />
              2FA Saugumo nustatymai
            </DialogTitle>
          </DialogHeader>
          
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Pasirinkite vieną iš paprastų ir patikimų dviejų faktorių autentifikavimo metodų.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="totp" className="flex items-center gap-1 text-xs h-6">
                <Smartphone className="w-3 h-3" />
                TOTP App
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1 text-xs h-6">
                <Mail className="w-3 h-3" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4 mt-4">
              <div className="text-center space-y-3">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-base mb-2">TOTP Authenticator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Naudokite savo telefone įdiegtą autentifikavimo programėlę.
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-2">
                  <p className="font-medium">Palaikomos programėlės:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-background px-2 py-1 rounded">Google Authenticator</span>
                    <span className="bg-background px-2 py-1 rounded">Microsoft Authenticator</span>
                    <span className="bg-background px-2 py-1 rounded">Authy</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Veikia be interneto ryšio</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Aukščiausias saugumo lygis</span>
                </div>

                <Button 
                  onClick={handleTOTPSetup}
                  className="w-full"
                  size="sm"
                >
                  Įjungti TOTP autentifikaciją
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="text-center space-y-3">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-base mb-2">Email patvirtinimas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gaukite patvirtinimo kodus į savo el. paštą.
                  </p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                  <p className="font-medium">Kaip veikia:</p>
                  <p>1. Prisijungiant sistema išsiųs kodą į jūsų el. paštą</p>
                  <p>2. Įveskite gautą kodą prisijungimo lange</p>
                  <p>3. Kodas galioja 5 minutes</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Paprastas naudojimas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Nereikia papildomų programėlių</span>
                </div>

                <Button 
                  onClick={setupEmailAuth}
                  disabled={loading}
                  className="w-full"
                  size="sm"
                >
                  {loading ? "Konfigūruojama..." : "Įjungti Email 2FA"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TOTPSetupModal
        open={totpModalOpen}
        onOpenChange={setTotpModalOpen}
        onSetupComplete={handleTOTPComplete}
      />
    </>
  );
}