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
    console.log('Telegram bot setup function started');
    
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!telegramToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ 
          error: 'TELEGRAM_BOT_TOKEN not configured',
          details: 'Please add your Telegram bot token to Supabase secrets'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate token format (should start with digits followed by colon and contain at least some characters)
    if (!telegramToken.match(/^\d+:.+$/)) {
      console.error('Invalid TELEGRAM_BOT_TOKEN format');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid TELEGRAM_BOT_TOKEN format',
          details: 'Token should be in format: 123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { action } = requestBody;
    console.log('Action requested:', action);

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

    if (action === 'test_token') {
      // Test if the bot token is valid by calling getMe
      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/getMe`;
      
      try {
        const response = await fetch(telegramUrl);
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Token test failed:', result);
          return new Response(
            JSON.stringify({ 
              error: 'Invalid bot token', 
              details: result.description || 'Token verification failed'
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log('Token test successful:', result.result);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Bot token is valid',
            bot: result.result 
          }),
          { headers: corsHeaders }
        );
      } catch (fetchError) {
        console.error('Network error during token test:', fetchError);
        return new Response(
          JSON.stringify({ 
            error: 'Network error', 
            details: 'Unable to connect to Telegram API'
          }),
          { status: 500, headers: corsHeaders }
        );
      }
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