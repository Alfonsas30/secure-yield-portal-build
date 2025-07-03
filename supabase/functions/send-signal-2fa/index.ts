import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Signal 2FA function started');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No Authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
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

    const { action, phone_number, display_name } = requestBody;
    console.log(`Action: ${action}, User: ${user.id}, Phone: ${phone_number}`);

    if (action === 'setup') {
      // Setup Signal 2FA for user
      const { error: insertError } = await supabaseClient
        .from('messenger_2fa')
        .upsert({
          user_id: user.id,
          messenger_type: 'signal',
          messenger_id: phone_number,
          display_name: display_name || `Signal (${phone_number})`,
          is_active: true
        });

      if (insertError) {
        console.error('Error setting up Signal 2FA:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to setup Signal 2FA' }),
          { status: 500, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Signal 2FA setup successful' }),
        { headers: corsHeaders }
      );
    }

    if (action === 'send_code') {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Update the messenger_2fa record with the code
      const { error: updateError } = await supabaseClient
        .from('messenger_2fa')
        .update({
          verification_code: code,
          code_expires_at: expiresAt.toISOString(),
          code_attempts: 0
        })
        .eq('user_id', user.id)
        .eq('messenger_type', 'signal')
        .eq('messenger_id', phone_number);

      if (updateError) {
        console.error('Error updating verification code:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate verification code' }),
          { status: 500, headers: corsHeaders }
        );
      }

      // Send message via Signal CLI
      const signalApiUrl = Deno.env.get('SIGNAL_API_URL');
      const signalApiToken = Deno.env.get('SIGNAL_API_TOKEN');
      const signalNumber = Deno.env.get('SIGNAL_NUMBER');

      if (!signalApiUrl || !signalApiToken || !signalNumber) {
        return new Response(
          JSON.stringify({ error: 'Signal integration not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }

      const message = `🔐 Jūsų VILTB patvirtinimo kodas: ${code}\n\nKodas galioja 5 minutes.\nNiekada nesidalinkite šiuo kodu su kitais!`;

      const signalResponse = await fetch(`${signalApiUrl}/v2/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signalApiToken}`,
        },
        body: JSON.stringify({
          number: signalNumber,
          recipients: [phone_number],
          message: message
        }),
      });

      if (!signalResponse.ok) {
        const signalError = await signalResponse.text();
        console.error('Signal API error:', signalError);
        return new Response(
          JSON.stringify({ error: 'Failed to send Signal message' }),
          { status: 500, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Verification code sent via Signal' }),
        { headers: corsHeaders }
      );
    }

    if (action === 'verify_code') {
      const { code } = requestBody;

      // Get the stored verification data
      const { data: messengerData, error: fetchError } = await supabaseClient
        .from('messenger_2fa')
        .select('*')
        .eq('user_id', user.id)
        .eq('messenger_type', 'signal')
        .eq('messenger_id', phone_number)
        .single();

      if (fetchError || !messengerData) {
        return new Response(
          JSON.stringify({ error: 'Signal 2FA not configured' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Check if code is expired
      if (new Date() > new Date(messengerData.code_expires_at)) {
        return new Response(
          JSON.stringify({ error: 'Verification code expired' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Check attempts limit
      if (messengerData.code_attempts >= 3) {
        return new Response(
          JSON.stringify({ error: 'Too many failed attempts' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Verify the code
      if (messengerData.verification_code !== code) {
        // Increment attempts
        await supabaseClient
          .from('messenger_2fa')
          .update({ code_attempts: messengerData.code_attempts + 1 })
          .eq('id', messengerData.id);

        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Clear the verification code after successful verification
      await supabaseClient
        .from('messenger_2fa')
        .update({
          verification_code: null,
          code_expires_at: null,
          code_attempts: 0
        })
        .eq('id', messengerData.id);

      return new Response(
        JSON.stringify({ success: true, message: 'Signal verification successful' }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in Signal 2FA function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});