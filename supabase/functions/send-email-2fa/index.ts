
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Email 2FA function started');
    
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
    console.log(`Action: ${action}`);

    // For verify_code action, we don't need authentication since user isn't logged in yet
    if (action === 'verify_code') {
      const { code, email } = requestBody;
      console.log('Verifying Email 2FA code for email:', email);

      if (!code || !email) {
        return new Response(
          JSON.stringify({ error: 'Verification code and email are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the stored verification data by email
      const { data: messengerData, error: fetchError } = await supabaseClient
        .from('messenger_2fa')
        .select('*')
        .eq('messenger_type', 'email')
        .eq('messenger_id', email)
        .single();

      if (fetchError || !messengerData) {
        console.error('Email 2FA not configured for email:', email, fetchError);
        return new Response(
          JSON.stringify({ error: 'Email 2FA not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if code is expired
      if (!messengerData.code_expires_at || new Date() > new Date(messengerData.code_expires_at)) {
        console.log('Verification code expired for email:', email);
        return new Response(
          JSON.stringify({ error: 'Verification code expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check attempts limit
      if (messengerData.code_attempts >= 3) {
        console.log('Too many failed attempts for email:', email);
        return new Response(
          JSON.stringify({ error: 'Too many failed attempts' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the code
      if (messengerData.verification_code !== code) {
        console.log('Invalid verification code for email:', email);
        
        // Increment attempts
        await supabaseClient
          .from('messenger_2fa')
          .update({ code_attempts: messengerData.code_attempts + 1 })
          .eq('id', messengerData.id);

        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      console.log('Email 2FA verification successful for email:', email);
      return new Response(
        JSON.stringify({ success: true, message: 'Email verification successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For other actions, we need authentication
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

    console.log(`Action: ${action}, User: ${user.id}`);

    if (action === 'setup') {
      console.log('Setting up Email 2FA for user:', user.id, user.email);
      
      // Setup Email 2FA for user
      const { error: insertError } = await supabaseClient
        .from('messenger_2fa')
        .upsert({
          user_id: user.id,
          messenger_type: 'email',
          messenger_id: user.email,
          display_name: `Email (${user.email})`,
          is_active: true,
          is_primary: true
        });

      if (insertError) {
        console.error('Error setting up Email 2FA:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to setup Email 2FA', details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Email 2FA setup successful for user:', user.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Email 2FA setup successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        .eq('messenger_type', 'email')
        .eq('messenger_id', user.email);

      if (updateError) {
        console.error('Error updating verification code:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate verification code' }),
          { status: 500, headers: corsHeaders }
        );
      }

      // Send email via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        return new Response(
          JSON.stringify({ error: 'Email service not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }

      const resend = new Resend(resendApiKey);

      try {
        const emailResponse = await resend.emails.send({
          from: "VILTB Bankas <onboarding@resend.dev>",
          to: [user.email],
          subject: "🔐 VILTB Patvirtinimo kodas",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb; text-align: center;">🔐 Patvirtinimo kodas</h1>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h2 style="font-size: 32px; letter-spacing: 5px; margin: 0; color: #1e293b;">${code}</h2>
              </div>
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                Jūsų VILTB patvirtinimo kodas yra: <strong>${code}</strong>
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                • Kodas galioja 5 minutes<br>
                • Niekada nesidalinkite šiuo kodu su kitais<br>
                • Jei negavote šio kodo prašymo, ignoruokite šį laišką
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                VILTB Banko sistema - Saugus ir patikimas
              </p>
            </div>
          `
        });

        console.log('Email sent successfully:', emailResponse);

        return new Response(
          JSON.stringify({ success: true, message: 'Verification code sent via email' }),
          { headers: corsHeaders }
        );
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { status: 500, headers: corsHeaders }
        );
      }
    }


    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in Email 2FA function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
