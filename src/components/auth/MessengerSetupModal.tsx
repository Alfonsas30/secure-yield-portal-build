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
import { MessageCircle, Phone, Shield, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      // WhatsApp setup logic will be implemented later
      toast({
        title: "WhatsApp 2FA",
        description: "WhatsApp integracija bus pridėta netrukus",
      });
    } catch (error) {
      console.error('WhatsApp setup error:', error);
      toast({
        title: t('discount.error'),
        description: "Nepavyko nustatyti WhatsApp 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Messenger 2FA nustatymai
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Telegram
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telegram" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Telegram bot leis jums gauti patvirtinimo kodus per Telegram žinutes.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  Telegram Bot konfigūracija
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
                  <p>2. Paspauskite "Start" ir išsiųskite /start</p>
                  <p>3. Bot atsiųs jūsų Telegram ID - nukopijuokite jį</p>
                  <p>4. Įveskite Telegram ID žemiau</p>
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
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                WhatsApp integracija bus pridėta ateityje. Kol kas naudokite Telegram arba TOTP.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">WhatsApp Business API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>• SMS patvirtinimo kodai per WhatsApp</p>
                  <p>• Automatinis kodų nuskaitymas</p>
                  <p>• Palaikymas visose šalyse</p>
                </div>
                <Badge variant="secondary" className="text-xs">Greitai</Badge>
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
                  disabled
                />
              </div>

              <Button 
                onClick={setupWhatsApp}
                disabled={true}
                className="w-full"
                variant="secondary"
              >
                Greitai prieinamas
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}