import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!telegramToken) {
      return new Response(
        JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { action } = await req.json();

    if (action === 'setup_webhook') {
      // Set up webhook URL for the bot
      const webhookUrl = `https://latwptcvghypdopbpxfr.supabase.co/functions/v1/telegram-webhook`;
      
      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/setWebhook`;
      
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message']
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to set webhook:', result);
        return new Response(
          JSON.stringify({ error: 'Failed to set webhook', details: result }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('Webhook set successfully:', result);
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook configured successfully', data: result }),
        { headers: corsHeaders }
      );
    }

    if (action === 'get_bot_info') {
      // Get bot information
      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/getMe`;
      
      const response = await fetch(telegramUrl);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to get bot info:', result);
        return new Response(
          JSON.stringify({ error: 'Failed to get bot info', details: result }),
          { status: 500, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: true, bot: result.result }),
        { headers: corsHeaders }
      );
    }

    if (action === 'get_webhook_info') {
      // Get current webhook information
      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/getWebhookInfo`;
      
      const response = await fetch(telegramUrl);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to get webhook info:', result);
        return new Response(
          JSON.stringify({ error: 'Failed to get webhook info', details: result }),
          { status: 500, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: true, webhook: result.result }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in Telegram bot setup:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});