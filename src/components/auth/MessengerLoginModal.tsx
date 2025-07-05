import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Clock, RefreshCw, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessengerLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  email: string;
}

export function MessengerLoginModal({ open, onOpenChange, onVerified, email }: MessengerLoginModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [messengerMethods, setMessengerMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMessengerMethods();
    }
  }, [open]);

  useEffect(() => {
    if (timeLeft > 0 && codeSent) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, codeSent]);

  const fetchMessengerMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messenger_2fa')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setMessengerMethods(data || []);
      if (data && data.length > 0) {
        setSelectedMethod(data[0]);
      }
    } catch (error) {
      console.error('Error fetching messenger methods:', error);
    }
  };

  const sendCode = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    try {
      if (selectedMethod.messenger_type === 'telegram') {
        const { data, error } = await supabase.functions.invoke('send-telegram-2fa', {
          body: { 
            action: 'send_code',
            telegram_id: selectedMethod.messenger_id
          }
        });

        if (error) throw error;
      } else if (selectedMethod.messenger_type === 'viber') {
        const { data, error } = await supabase.functions.invoke('send-viber-2fa', {
          body: { 
            action: 'send_code',
            phone_number: selectedMethod.messenger_id
          }
        });

        if (error) throw error;
      } else if (selectedMethod.messenger_type === 'signal') {
        const { data, error } = await supabase.functions.invoke('send-signal-2fa', {
          body: { 
            action: 'send_code',
            phone_number: selectedMethod.messenger_id
          }
        });

        if (error) throw error;
      }

      setCodeSent(true);
      setTimeLeft(300);
      toast({
        title: "Kodas išsiųstas",
        description: `Patvirtinimo kodas išsiųstas į ${selectedMethod.display_name}`,
      });
    } catch (error) {
      console.error('Error sending code:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko išsiųsti kodo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!selectedMethod || !code) return;

    setLoading(true);
    try {
      if (selectedMethod.messenger_type === 'telegram') {
        const { data, error } = await supabase.functions.invoke('send-telegram-2fa', {
          body: { 
            action: 'verify_code',
            telegram_id: selectedMethod.messenger_id,
            code: code
          }
        });

        if (error) throw error;
      } else if (selectedMethod.messenger_type === 'viber') {
        const { data, error } = await supabase.functions.invoke('send-viber-2fa', {
          body: { 
            action: 'verify_code',
            phone_number: selectedMethod.messenger_id,
            code: code
          }
        });

        if (error) throw error;
      } else if (selectedMethod.messenger_type === 'signal') {
        const { data, error } = await supabase.functions.invoke('send-signal-2fa', {
          body: { 
            action: 'verify_code',
            phone_number: selectedMethod.messenger_id,
            code: code
          }
        });

        if (error) throw error;
      }

      toast({
        title: "Patvirtinimas sėkmingas",
        description: "Prisijungimas sėkmingas",
      });
      
      onVerified();
      onOpenChange(false);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Neteisingas kodas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!messengerMethods.length) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Messenger 2FA neprieinamas</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Jūs dar nesukonfigūravote messenger 2FA. Prašome naudoti el. paštą arba TOTP.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Grįžti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Messenger 2FA prisijungimas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Messenger method selection */}
          <div className="space-y-3">
            <Label>Pasirinkite metodą:</Label>
            <div className="grid gap-2">
              {messengerMethods.map((method) => (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMethod?.id === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    {method.messenger_type === 'telegram' && <MessageCircle className="w-4 h-4" />}
                    
                    {method.messenger_type === 'viber' && <MessageCircle className="w-4 h-4" />}
                    {method.messenger_type === 'signal' && <Shield className="w-4 h-4" />}
                    <div className="flex-1">
                      <div className="font-medium">{method.display_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {method.messenger_type}
                      </div>
                    </div>
                    {method.is_primary && <Badge variant="secondary">Pagrindinis</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {!codeSent ? (
            <Button 
              onClick={sendCode}
              disabled={loading || !selectedMethod}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Siunčiamas kodas...
                </>
              ) : (
                `Siųsti kodą per ${selectedMethod?.messenger_type || 'messenger'}`
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Kodas galioja: {formatTime(timeLeft)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Patvirtinimo kodas</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={verifyCode}
                  disabled={loading || !code || code.length !== 6}
                  className="flex-1"
                >
                  {loading ? "Tikrinamas..." : "Patvirtinti"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={sendCode}
                  disabled={loading || timeLeft > 240} // Can resend after 1 minute
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setCodeSent(false);
                    setCode("");
                    setTimeLeft(300);
                  }}
                  className="text-sm"
                >
                  Keisti metodą
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}