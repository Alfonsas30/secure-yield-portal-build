import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Shield, Copy, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface TOTPSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: (backupCodes: string[]) => void;
}

export function TOTPSetupModal({ open, onOpenChange, onSetupComplete }: TOTPSetupModalProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && step === 'setup') {
      setupTOTP();
    }
  }, [open, step]);

  const setupTOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-totp');
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataUrl(qrDataUrl);
      setSecret(data.secret);
      setStep('verify');
    } catch (error: any) {
      console.error('TOTP setup error:', error);
      toast({
        title: "TOTP nustatymo klaida",
        description: error.message || "Nepavyko nustatyti TOTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (totpCode.length !== 6) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-totp-setup', {
        body: { code: totpCode }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setBackupCodes(data.backupCodes || []);
      setStep('complete');
      
      toast({
        title: "TOTP sėkmingai nustatytas",
        description: "Dviejų faktorių autentifikavimas įjungtas",
        variant: "default"
      });
    } catch (error: any) {
      console.error('TOTP verification error:', error);
      toast({
        title: "Patvirtinimo klaida",
        description: error.message || "Neteisingas kodas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Nukopijuota",
      description: "Slaptas kodas nukopijuotas",
      variant: "default"
    });
  };

  const downloadBackupCodes = () => {
    const content = `Banko Sistema - Atsarginiai kodai\n\nIšsaugokite šiuos kodus saugioje vietoje.\nKiekvienas kodas gali būti naudojamas tik vieną kartą.\n\n${backupCodes.join('\n')}\n\nSukurta: ${new Date().toLocaleString('lt-LT')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banko-sistema-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    console.log('TOTP setup completed, calling onSetupComplete with backup codes:', backupCodes);
    onSetupComplete(backupCodes);
    onOpenChange(false);
    setStep('setup');
    setTotpCode("");
    setQrCodeDataUrl("");
    setSecret("");
    setBackupCodes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Dviejų faktorių autentifikavimas
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <p>Ruošiama TOTP nustatymas...</p>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                1. Nuskaitykite QR kodą su Authenticator programėle
              </p>
              
              {qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeDataUrl} alt="QR kodas" className="border rounded" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Arba įveskite slaptos kodą rankiniu būdu:
                </p>
                <div className="flex items-center gap-2">
                  <Input 
                    value={secret} 
                    readOnly 
                    className="text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  2. Įveskite 6 skaitmenų kodą iš programėlės
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={totpCode}
                    onChange={setTotpCode}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={verifyTOTP} 
                className="w-full" 
                disabled={loading || totpCode.length !== 6}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Patvirtinti nustatymą
              </Button>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-medium">Rekomenduojamos programėlės:</p>
              <ul className="text-muted-foreground">
                <li>• Google Authenticator</li>
                <li>• Microsoft Authenticator</li>
                <li>• Authy</li>
                <li>• 1Password</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">TOTP nustatytas sėkmingai!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dviejų faktorių autentifikavimas dabar įjungtas jūsų paskyroje.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Atsarginiai kodai</Label>
              <p className="text-xs text-muted-foreground">
                Išsaugokite šiuos kodus saugioje vietoje. Galėsite juos naudoti prisijungimui, jei prarasite prieigą prie Authenticator programėlės.
              </p>
              
              <div className="bg-muted/50 p-3 rounded border font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>

              <Button 
                onClick={downloadBackupCodes} 
                variant="outline" 
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Parsisiųsti atsarginius kodus
              </Button>

              <Button onClick={handleComplete} className="w-full">
                Baigti nustatymą
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}