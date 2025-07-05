import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, AlertCircle, RefreshCw, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TelegramBotSetup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState(null);
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState(null);

  const testToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'test_token' }
      });

      if (error) throw error;

      if (data.success) {
        setTokenValid(true);
        setBotInfo(data.bot);
        toast({
          title: "Token sėkmingai patikrintas",
          description: `Bot'as "${data.bot.first_name}" (@${data.bot.username}) veikia`,
        });
      }
    } catch (error) {
      console.error('Token test error:', error);
      setError(error?.message || "Nepavyko patikrinti bot token");
      setTokenValid(false);
      toast({
        title: "Token klaida",
        description: error?.message || "Nepavyko patikrinti bot token",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Telegram Bot'o konfigūracija
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Pirma reikia sukonfigūruoti Telegram bot'ą sistemoje.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Klaida:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button 
            onClick={testToken}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 text-xs h-8"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Tikrinama...
              </>
            ) : (
              <>
                <TestTube className="w-3 h-3" />
                Testuoti Token
              </>
            )}
          </Button>
          <Button 
            onClick={setupWebhook}
            disabled={loading || !tokenValid}
            size="sm"
            className="text-xs h-8"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Konfigūruojama...
              </>
            ) : (
              "Webhook"
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={checkBotStatus}
            disabled={loading}
            size="sm"
            className="text-xs h-8"
          >
            Patikrinti būseną
          </Button>
        </div>

        {botInfo && (
          <div className="space-y-2 p-2 bg-muted/20 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium">Bot'as veikia</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Vardas:</strong> {botInfo.first_name}</p>
              <p><strong>Username:</strong> @{botInfo.username}</p>
              <p><strong>ID:</strong> {botInfo.id}</p>
            </div>
          </div>
        )}

        {webhookInfo && (
          <div className="space-y-2 p-2 bg-muted/20 rounded-md">
            <div className="flex items-center gap-2">
              {webhookInfo.url ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium">Webhook aktyvus</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium">Webhook nesukonfigūruotas</span>
                </>
              )}
            </div>
            {webhookInfo.url && (
              <div className="text-xs text-muted-foreground">
                <p className="break-all"><strong>URL:</strong> {webhookInfo.url}</p>
                {webhookInfo.last_error_date && (
                  <p><strong>Atnaujinta:</strong> {new Date(webhookInfo.last_error_date * 1000).toLocaleString()}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs h-5">🤖 Bot API</Badge>
          <Badge variant="outline" className="text-xs h-5">📡 Webhook</Badge>
          <Badge variant="outline" className="text-xs h-5">🔄 Real-time</Badge>
        </div>
      </CardContent>
    </Card>
  );
}