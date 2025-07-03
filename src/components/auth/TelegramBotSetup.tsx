import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TelegramBotSetup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);

  const setupWebhook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'setup_webhook' }
      });

      if (error) throw error;

      toast({
        title: "Webhook sukonfigūruotas",
        description: "Telegram bot'as dabar gali priimti žinutes",
      });
      
      await checkBotStatus();
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko sukonfigūruoti webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBotStatus = async () => {
    setLoading(true);
    try {
      // Get bot info
      const { data: botData, error: botError } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'get_bot_info' }
      });

      if (botError) throw botError;
      setBotInfo(botData.bot);

      // Get webhook info
      const { data: webhookData, error: webhookError } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'get_webhook_info' }
      });

      if (webhookError) throw webhookError;
      setWebhookInfo(webhookData.webhook);

    } catch (error) {
      console.error('Bot status check error:', error);
      toast({
        title: t('discount.error'),
        description: error?.message || "Nepavyko patikrinti bot'o būsenos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Telegram Bot'o konfigūracija
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pirma reikia sukonfigūruoti Telegram bot'ą sistemoje.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={setupWebhook}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Konfigūruojama...
              </>
            ) : (
              "Sukonfigūruoti Webhook"
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={checkBotStatus}
            disabled={loading}
            size="sm"
          >
            Patikrinti būseną
          </Button>
        </div>

        {botInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Bot'as aktyvus</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p><strong>Vardas:</strong> {botInfo.first_name}</p>
              <p><strong>Username:</strong> @{botInfo.username}</p>
              <p><strong>ID:</strong> {botInfo.id}</p>
            </div>
          </div>
        )}

        {webhookInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {webhookInfo.url ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Webhook aktyvus</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Webhook nesukonfigūruotas</span>
                </>
              )}
            </div>
            {webhookInfo.url && (
              <div className="text-xs text-muted-foreground">
                <p><strong>URL:</strong> {webhookInfo.url}</p>
                <p><strong>Paskutinis atnaujinimas:</strong> {new Date(webhookInfo.last_error_date * 1000).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">🤖 Bot API</Badge>
          <Badge variant="outline" className="text-xs">📡 Webhook</Badge>
          <Badge variant="outline" className="text-xs">🔄 Real-time</Badge>
        </div>
      </CardContent>
    </Card>
  );
}