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
    console.log('🔍 Testing Telegram bot token...');
    
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'test_token' }
      });

      console.log('🔍 Bot test response:', { data, error });

      if (error) {
        console.error('🚨 Bot test error:', error);
        throw error;
      }

      if (data?.success) {
        setTokenValid(true);
        setBotInfo(data.bot);
        console.log('✅ Bot test successful:', data.bot);
        toast({
          title: "Token sėkmingai patikrintas",
          description: `Bot'as "${data.bot.first_name}" (@${data.bot.username}) veikia`,
        });
      } else {
        throw new Error(data?.error || 'Bot token testas nepavyko');
      }
    } catch (error: any) {
      console.error('🚨 Token test error:', error);
      const errorMessage = error?.message || error?.details || "Nepavyko patikrinti bot token";
      setError(errorMessage);
      setTokenValid(false);
      toast({
        title: "Token klaida", 
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupWebhook = async () => {
    setLoading(true);
    console.log('🔧 Setting up Telegram webhook...');
    
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot-setup', {
        body: { action: 'setup_webhook' }
      });

      console.log('🔧 Webhook setup response:', { data, error });

      if (error) {
        console.error('🚨 Webhook setup error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Webhook setup successful');
        toast({
          title: "Webhook sukonfigūruotas",
          description: "Telegram bot'as dabar gali priimti žinutes",
        });
        
        await checkBotStatus();
      } else {
        throw new Error(data?.error || 'Webhook konfigūracija nepavyko');
      }
    } catch (error: any) {
      console.error('🚨 Webhook setup error:', error);
      const errorMessage = error?.message || error?.details || "Nepavyko sukonfigūruoti webhook";
      toast({
        title: "Klaida",
        description: errorMessage,
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