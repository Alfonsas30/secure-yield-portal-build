import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BinanceConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function BinanceConnectModal({ open, onOpenChange, onConnected }: BinanceConnectModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: t('discount.error'),
        description: t('binance.credentials.required'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('connect-binance-account', {
        body: { 
          action: 'verify',
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim()
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t('binance.connect.successTitle'),
          description: t('binance.connect.successMessage'),
        });
        onConnected();
        onOpenChange(false);
        setApiKey("");
        setApiSecret("");
      }
    } catch (error) {
      console.error('Binance connection error:', error);
      toast({
        title: t('discount.error'),
        description: t('binance.connect.error'),
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
            <Shield className="w-5 h-5 text-yellow-500" />
            {t('binance.connect.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('binance.security.warning')}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {t('binance.setup.title')}
                <a 
                  href="https://www.binance.com/en/my/settings/api-management" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  API
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs space-y-1">
                <p>1. {t('binance.setup.step1')}</p>
                <p>2. {t('binance.setup.step2')}</p>
                <p>3. {t('binance.setup.step3')}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">✓ {t('binance.permissions.read')}</Badge>
                <Badge variant="destructive" className="text-xs">✗ {t('binance.permissions.trade')}</Badge>
                <Badge variant="destructive" className="text-xs">✗ {t('binance.permissions.withdraw')}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('binance.credentials.apiKey')}</Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">{t('binance.credentials.apiSecret')}</Label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="API Secret"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <Button 
            onClick={handleConnect}
            disabled={loading || !apiKey || !apiSecret}
            className="w-full"
          >
            {loading ? t('binance.connect.connecting') : t('binance.connect.button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}