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
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [viberNumber, setViberNumber] = useState("");
  const [signalNumber, setSignalNumber] = useState("");
  const [activeTab, setActiveTab] = useState("telegram");

  const setupTelegram = async () => {
    if (!telegramId) {
      toast({
        title: t('discount.error'),
        description: "Įveskite Telegram ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-2fa', {
        body: { 
          action: 'setup',
          telegram_id: telegramId,
          display_name: `Telegram (${telegramId})`
        }
      });

      if (error) throw error;

      toast({
        title: "Telegram 2FA sukonfigūruotas",
        description: "Telegram 2FA sėkmingai įjungtas jūsų paskyroje",
      });
      
      onSetupComplete();
      onOpenChange(false);
      setTelegramId("");
    } catch (error) {
      console.error('Telegram setup error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko nustatyti Telegram 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupWhatsApp = async () => {
    if (!whatsappNumber) {
      toast({
        title: t('discount.error'),
        description: "Įveskite WhatsApp numerį",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-2fa', {
        body: { 
          action: 'setup',
          phone_number: whatsappNumber,
          display_name: `WhatsApp (${whatsappNumber})`
        }
      });

      if (error) throw error;

      toast({
        title: "WhatsApp 2FA sukonfigūruotas",
        description: "WhatsApp 2FA sėkmingai įjungtas jūsų paskyroje",
      });
      
      onSetupComplete();
      onOpenChange(false);
      setWhatsappNumber("");
    } catch (error) {
      console.error('WhatsApp setup error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko nustatyti WhatsApp 2FA",
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Messenger 2FA nustatymai
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="viber" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Viber
            </TabsTrigger>
            <TabsTrigger value="signal" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Signal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telegram" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Telegram bot leis jums gauti patvirtinimo kodus per Telegram žinutes.
              </AlertDescription>
            </Alert>

            <TelegramBotSetup />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Vartotojo instrukcijos
                  <a 
                    href="https://t.me/viltb_security_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    @viltb_security_bot
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p>1. Atidarykite Telegram ir eikite į @viltb_security_bot</p>
                  <p>2. Paspauskite "Start" ir išsiųskite <code>/start</code></p>
                  <p>3. Bot'as atsiųs jūsų Telegram ID numerį</p>
                  <p>4. Nukopijuokite ID ir įveskite jį žemiau</p>
                  <p>5. Paspauskite "Įjungti Telegram 2FA"</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">✓ Greitas gavimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ Saugus šifravimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ 24/7 prieinamumas</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="telegramId">Telegram ID</Label>
                <Input
                  id="telegramId"
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="123456789"
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={setupTelegram}
                disabled={loading || !telegramId}
                className="w-full"
              >
                {loading ? "Konfigūruojama..." : "Įjungti Telegram 2FA"}
              </Button>
            </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                WhatsApp integracija naudoja Twilio API patvirtinimo kodų siuntimui.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">WhatsApp Business API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p>1. Įveskite savo WhatsApp numerį žemiau</p>
                  <p>2. Numeris bus susietas su jūsų paskyra</p>
                  <p>3. Gausite patvirtinimo kodus per WhatsApp</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">✓ Greitas gavimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ Patogus naudojimas</Badge>
                  <Badge variant="outline" className="text-xs">✓ Pasaulinis</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp numeris</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+37060000000"
                />
              </div>

              <Button 
                onClick={setupWhatsApp}
                disabled={loading || !whatsappNumber}
                className="w-full"
              >
                {loading ? "Konfigūruojama..." : "Įjungti WhatsApp 2FA"}
              </Button>
            </div>
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