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
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return new Response('Bot not configured', { status: 500 });
    }

    // Parse the incoming webhook data from Telegram
    const update = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Handle incoming messages
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      const userName = message.from?.first_name || 'Vartotojas';

      console.log(`Message from ${userName} (${chatId}): ${text}`);

      // Handle /start command
      if (text === '/start') {
        const welcomeMessage = `👋 Sveiki, ${userName}!

🔐 Tai yra VILTB saugumo bot'as, skirtas dviejų faktorių autentifikacijai.

📱 **Jūsų Telegram ID:** \`${chatId}\`

ℹ️ **Kaip naudoti:**
1. Nukopijuokite aukščiau esantį ID numerį
2. Grįžkite į VILTB svetainę
3. Įveskite šį ID į Telegram 2FA nustatymų formą
4. Po sėkmingo konfigūravimo gausite patvirtinimo kodus per šį bot'ą

🛡️ **Saugumas:**
• Niekada nesidalinkite šiuo ID su kitais
• Bot'as siųs tik patvirtinimo kodus
• Kodai galioja 5 minutes

✅ Dabar galite grįžti į VILTB svetainę ir užbaigti Telegram 2FA konfigūraciją!`;

        // Send welcome message with chat ID
        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'Markdown'
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to send Telegram message:', error);
          return new Response('Failed to send message', { status: 500 });
        }

        console.log(`Sent welcome message to ${userName} (${chatId})`);
      } else {
        // Handle other messages with helpful info
        const helpMessage = `ℹ️ Šis bot'as skirtas tik VILTB 2FA patvirtinimo kodų gavimui.

📱 Jūsų Telegram ID: \`${chatId}\`

💡 Jei norite konfigūruoti 2FA:
1. Nukopijuokite aukščiau esantį ID
2. Eikite į VILTB svetainę → Saugumo nustatymai
3. Pasirinkite "Messenger 2FA" → "Telegram"
4. Įveskite šį ID ir spauskite "Įjungti Telegram 2FA"

❓ Jei reikia pagalbos, susisiekite su VILTB palaikymo komanda.`;

        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
        
        await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: helpMessage,
            parse_mode: 'Markdown'
          }),
        });

        console.log(`Sent help message to ${userName} (${chatId})`);
      }
    }

    // Always return 200 OK to Telegram
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});