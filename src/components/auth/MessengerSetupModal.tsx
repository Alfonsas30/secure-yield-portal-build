import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Phone, Shield, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TelegramBotSetup } from "./TelegramBotSetup";

interface MessengerSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: () => void;
}

export function MessengerSetupModal({ open, onOpenChange, onSetupComplete }: MessengerSetupModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [telegramId, setTelegramId] = useState("");
  
  const [viberNumber, setViberNumber] = useState("");
  const [signalNumber, setSignalNumber] = useState("");
  const [activeTab, setActiveTab] = useState("telegram");

  const setupTelegram = async () => {
    if (!telegramId || telegramId.trim() === "") {
      toast({
        title: t('discount.error'),
        description: "Įveskite Telegram ID",
        variant: "destructive"
      });
      return;
    }

    // Validate Telegram ID format (should be numeric)
    if (!/^\d+$/.test(telegramId.trim())) {
      toast({
        title: t('discount.error'),
        description: "Telegram ID turi būti skaičius (pvz., 123456789)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('🔧 Setting up Telegram 2FA for ID:', telegramId);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-2fa', {
        body: { 
          action: 'setup',
          telegram_id: telegramId.trim(),
          display_name: `Telegram (${telegramId.trim()})`
        }
      });

      console.log('🔧 Telegram setup response:', { data, error });

      if (error) {
        console.error('🚨 Telegram setup error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Telegram 2FA setup successful');
        toast({
          title: "Telegram 2FA sukonfigūruotas",
          description: "Telegram 2FA sėkmingai įjungtas jūsų paskyroje",
        });
        
        onSetupComplete();
        onOpenChange(false);
        setTelegramId("");
      } else {
        throw new Error(data?.error || 'Telegram 2FA konfigūracija nepavyko');
      }
    } catch (error: any) {
      console.error('🚨 Telegram setup error:', error);
      const errorMessage = error?.message || error?.details || "Nepavyko nustatyti Telegram 2FA";
      toast({
        title: t('discount.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const setupViber = async () => {
    if (!viberNumber) {
      toast({
        title: t('discount.error'),
        description: "Įveskite Viber numerį",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-viber-2fa', {
        body: { 
          action: 'setup',
          phone_number: viberNumber,
          display_name: `Viber (${viberNumber})`
        }
      });

      if (error) throw error;

      toast({
        title: "Viber 2FA sukonfigūruotas",
        description: "Viber 2FA sėkmingai įjungtas jūsų paskyroje",
      });
      
      onSetupComplete();
      onOpenChange(false);
      setViberNumber("");
    } catch (error) {
      console.error('Viber setup error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko nustatyti Viber 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupSignal = async () => {
    if (!signalNumber) {
      toast({
        title: t('discount.error'),
        description: "Įveskite Signal numerį",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-signal-2fa', {
        body: { 
          action: 'setup',
          phone_number: signalNumber,
          display_name: `Signal (${signalNumber})`
        }
      });

      if (error) throw error;

      toast({
        title: "Signal 2FA sukonfigūruotas",
        description: "Signal 2FA sėkmingai įjungtas jūsų paskyroje",
      });
      
      onSetupComplete();
      onOpenChange(false);
      setSignalNumber("");
    } catch (error) {
      console.error('Signal setup error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko nustatyti Signal 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-primary" />
            Messenger 2FA nustatymai
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0 h-8">
            <TabsTrigger value="telegram" className="flex items-center gap-1 text-xs h-6">
              <MessageCircle className="w-3 h-3" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="viber" className="flex items-center gap-1 text-xs h-6">
              <MessageCircle className="w-3 h-3" />
              Viber
            </TabsTrigger>
            <TabsTrigger value="signal" className="flex items-center gap-1 text-xs h-6">
              <Shield className="w-3 h-3" />
              Signal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telegram" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Telegram bot leis jums gauti patvirtinimo kodus per Telegram žinutes.
              </AlertDescription>
            </Alert>

            <TelegramBotSetup />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Vartotojo instrukcijos</span>
                  <a 
                    href="https://t.me/VILTBBOT" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    @VILTBBOT
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs space-y-1 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Atidarykite Telegram ir eikite į @VILTBBOT</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Paspauskite "Start" ir parašykite <code className="bg-muted px-1 rounded text-xs">/start</code></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Bot'as atsiųs jūsų Telegram ID numerį</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>Nukopijuokite ID ir įveskite žemiau</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary">5.</span>
                    <span>Spauskite "Įjungti Telegram 2FA"</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Badge variant="outline" className="text-xs h-5">✓ Greitas</Badge>
                  <Badge variant="outline" className="text-xs h-5">✓ Saugus</Badge>
                  <Badge variant="outline" className="text-xs h-5">✓ 24/7</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="telegramId" className="text-xs font-medium">Telegram ID</Label>
                <Input
                  id="telegramId"
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="123456789"
                  className="font-mono text-sm h-8"
                />
              </div>

              <Button 
                onClick={setupTelegram}
                disabled={loading || !telegramId}
                className="w-full h-8 text-xs"
                size="sm"
              >
                {loading ? "Konfigūruojama..." : "Įjungti Telegram 2FA"}
              </Button>
            </div>
              </div>
            </ScrollArea>
          </TabsContent>


          <TabsContent value="viber" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Viber integracija naudoja Viber Bot API patvirtinimo kodų siuntimui.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Viber Bot API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p>1. Įveskite savo Viber numerį žemiau</p>
                  <p>2. Numeris bus susietas su jūsų paskyra</p>
                  <p>3. Gausite patvirtinimo kodus per Viber</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">✓ Populiarus Europoje</Badge>
                  <Badge variant="outline" className="text-xs">✓ Saugus šifravimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ Greitas</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="viberNumber">Viber numeris</Label>
                <Input
                  id="viberNumber"
                  type="tel"
                  value={viberNumber}
                  onChange={(e) => setViberNumber(e.target.value)}
                  placeholder="+37060000000"
                />
              </div>

              <Button 
                onClick={setupViber}
                disabled={loading || !viberNumber}
                className="w-full"
              >
                {loading ? "Konfigūruojama..." : "Įjungti Viber 2FA"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signal" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Signal integracija naudoja Signal CLI patvirtinimo kodų siuntimui.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Signal Private Messenger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p>1. Įveskite savo Signal numerį žemiau</p>
                  <p>2. Numeris bus susietas su jūsų paskyra</p>
                  <p>3. Gausite patvirtinimo kodus per Signal</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">✓ Aukščiausias saugumas</Badge>
                  <Badge variant="outline" className="text-xs">✓ End-to-end šifravimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ Open source</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="signalNumber">Signal numeris</Label>
                <Input
                  id="signalNumber"
                  type="tel"
                  value={signalNumber}
                  onChange={(e) => setSignalNumber(e.target.value)}
                  placeholder="+37060000000"
                />
              </div>

              <Button 
                onClick={setupSignal}
                disabled={loading || !signalNumber}
                className="w-full"
              >
                {loading ? "Konfigūruojama..." : "Įjungti Signal 2FA"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}