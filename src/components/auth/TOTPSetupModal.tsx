
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Shield, Copy, Download, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface TOTPSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete: (backupCodes: string[]) => void;
  required?: boolean; // If true, modal cannot be dismissed
}

export function TOTPSetupModal({ open, onOpenChange, onSetupComplete, required = false }: TOTPSetupModalProps) {
  const { t } = useTranslation();
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
      console.log('Starting TOTP setup...');
      const { data, error } = await supabase.functions.invoke('setup-totp');
      
      console.log('TOTP setup response:', { data, error });
      
      if (error) {
        console.error('TOTP setup error:', error);
        throw error;
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'TOTP konfigūracijos klaida';
        console.error('TOTP setup failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('TOTP setup successful, generating QR code...');

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataUrl(qrDataUrl);
      setSecret(data.secret);
      setStep('verify');
      
      console.log('QR code generated, moving to verify step');
    } catch (error: any) {
      console.error('TOTP setup error:', error);
      const errorMessage = error.message || error.error || 'TOTP konfigūracijos klaida';
      toast({
        title: "TOTP konfigūracijos klaida",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Reset to allow retry
      setStep('setup');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (totpCode.length !== 6) {
      toast({
        title: "Neteisingas kodas",
        description: "Įveskite 6 skaitmenų kodą",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('Verifying TOTP setup with code:', totpCode);
      
      const { data, error } = await supabase.functions.invoke('verify-totp-setup', {
        body: { token: totpCode }
      });
      
      console.log('TOTP verification response:', { data, error });
      
      if (error) {
        console.error('TOTP verification error:', error);
        throw error;
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || 'TOTP patvirtinimo klaida';
        console.error('TOTP verification failed:', errorMessage);
        throw new Error(errorMessage);
      }

      setBackupCodes(data.backupCodes || []);
      setStep('complete');
      
      console.log('TOTP verification successful, backup codes:', data.backupCodes?.length);
      
      toast({
        title: "TOTP sėkmingai sukonfigūruotas",
        description: "Dviejų faktorių autentifikavimas įjungtas",
        variant: "default"
      });
    } catch (error: any) {
      console.error('TOTP verification error:', error);
      const errorMessage = error.message || error.error || 'TOTP patvirtinimo klaida';
      toast({
        title: "TOTP patvirtinimo klaida",
        description: errorMessage,
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
      description: "Slaptasis kodas nukopijuotas į iškarpinę",
      variant: "default"
    });
  };

  const downloadBackupCodes = () => {
    const content = `VILTB Bankas - Atsarginiai kodai\n\nŠie kodai leidžia prisijungti, jei neturite prieigos prie autentifikavimo programėlės.\n\n${backupCodes.join('\n')}\n\nSukurta: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'viltb-atsarginiai-kodai.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    console.log('TOTP setup completed, calling onSetupComplete with backup codes:', backupCodes);
    onSetupComplete(backupCodes);
    onOpenChange(false);
    
    // Reset component state
    setTimeout(() => {
      setStep('setup');
      setTotpCode("");
      setQrCodeDataUrl("");
      setSecret("");
      setBackupCodes([]);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={required ? undefined : onOpenChange}>
      <DialogContent className="max-w-md" onPointerDownOutside={required ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            {required ? "Privalomas TOTP nustatymas" : "TOTP nustatymas"}
          </DialogTitle>
        </DialogHeader>

        {required && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
            <p className="text-yellow-800 font-medium">Saugumo sumetimais TOTP yra privalomas</p>
            <p className="text-yellow-700 mt-1">
              Įdiekite autentifikavimo programėlę ir sukonfigūrūokite TOTP
            </p>
          </div>
        )}

        {step === 'setup' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <p>Konfigūruojama TOTP...</p>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                1. Nuskenuokite QR kodą savo autentifikavimo programėlėje
              </p>
              
              {qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeDataUrl} alt="TOTP QR kodas" className="border rounded" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Arba įveskite kodą rankiniu būdu:
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
                {loading ? 'Tikrinama...' : 'Patvirtinti'}
              </Button>
            </div>

            {/* Time synchronization warning */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="font-medium text-blue-800">Svarbu apie laiką</p>
              </div>
              <p className="text-blue-700">
                TOTP kodai priklauso nuo tikslaus laiko. Jei kodas neveikia:
              </p>
              <ul className="text-blue-700 list-disc list-inside space-y-1">
                <li>Patikrinkite įrenginio laiko nustatymus</li>
                <li>Įjunkite automatinį laiko sinchronizavimą</li>
                <li>Bandykite naują kodą (kodai keičiasi kas 30 sek.)</li>
              </ul>
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
              <h3 className="text-lg font-semibold mb-2">TOTP sėkmingai sukonfigūruotas!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dviejų faktorių autentifikavimas įjungtas jūsų paskyroje
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Atsarginiai kodai</Label>
              <p className="text-xs text-muted-foreground">
                Išsaugokite šiuos kodus saugioje vietoje. Jie leis prisijungti be programėlės.
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
                Atsisiųsti atsarginius kodus
              </Button>

              <Button onClick={handleComplete} className="w-full">
                Baigti
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
