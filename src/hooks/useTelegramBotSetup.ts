import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BotInfo {
  first_name: string;
  username: string;
  id: number;
}

interface WebhookInfo {
  url?: string;
  last_error_date?: number;
}

export function useTelegramBotSetup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Webhook setup error:', error);
      toast({
        title: "Klaida",
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

    } catch (error: any) {
      console.error('Bot status check error:', error);
      toast({
        title: "Klaida",
        description: error?.message || "Nepavyko patikrinti bot'o būsenos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    botInfo,
    webhookInfo,
    tokenValid,
    error,
    testToken,
    setupWebhook,
    checkBotStatus
  };
}