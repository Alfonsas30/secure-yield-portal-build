import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
        title: t('totpSetup.toast.setupError'),
        description: error.message || t('totpSetup.toast.setupErrorDescription'),
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
        title: t('totpSetup.toast.setupSuccess'),
        description: t('totpSetup.toast.setupSuccessDescription'),
        variant: "default"
      });
    } catch (error: any) {
      console.error('TOTP verification error:', error);
      toast({
        title: t('totpSetup.toast.verifyError'),
        description: error.message || t('totpSetup.toast.verifyErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: t('totpSetup.toast.copied'),
      description: t('totpSetup.toast.copiedDescription'),
      variant: "default"
    });
  };

  const downloadBackupCodes = () => {
    const content = `${t('dashboard.title')} - ${t('totpSetup.success.backupCodes')}\n\n${t('totpSetup.success.backupDescription')}\n\n${backupCodes.join('\n')}\n\n${t('userProfile.registrationDate')}: ${new Date().toLocaleString()}`;
    
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
            {required ? t('totpSetup.requiredTitle') : t('totpSetup.title')}
          </DialogTitle>
        </DialogHeader>

        {required && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
            <p className="text-yellow-800 font-medium">{t('totpSetup.requiredWarning')}</p>
            <p className="text-yellow-700 mt-1">
              {t('totpSetup.requiredDescription')}
            </p>
          </div>
        )}

        {step === 'setup' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <p>{t('totpSetup.setupInProgress')}</p>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('totpSetup.step1')}
              </p>
              
              {qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeDataUrl} alt="QR kodas" className="border rounded" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('totpSetup.manualEntry')}
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
                  {t('totpSetup.step2')}
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
                {loading ? t('totpSetup.verifying') : t('totpSetup.verify')}
              </Button>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-medium">{t('totpSetup.apps.title')}</p>
              <ul className="text-muted-foreground">
                <li>• {t('totpSetup.apps.google')}</li>
                <li>• {t('totpSetup.apps.microsoft')}</li>
                <li>• {t('totpSetup.apps.authy')}</li>
                <li>• {t('totpSetup.apps.onepassword')}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">{t('totpSetup.success.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('totpSetup.success.description')}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('totpSetup.success.backupCodes')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('totpSetup.success.backupDescription')}
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
                {t('totpSetup.success.download')}
              </Button>

              <Button onClick={handleComplete} className="w-full">
                {t('totpSetup.success.complete')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}