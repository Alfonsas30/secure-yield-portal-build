import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerificationRequest {
  email: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SEND VERIFICATION CODE STARTED ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      throw new Error('El. pašto paslauga nesukonfigūruota');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized successfully');

    const requestBody = await req.json();
    const { email, user_id }: VerificationRequest = requestBody;
    
    console.log('Request body:', { email, user_id: user_id ? 'present' : 'null' });

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Cleanup old codes for this email
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Insert new verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: user_id || null,
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting verification code:', insertError);
      throw new Error('Nepavyko sukurti patvirtinimo kodo');
    }

    // Send email with verification code
    console.log(`Sending verification code to: ${email}`);
    const emailResponse = await resend.emails.send({
      from: 'VILTB Bankas <onboarding@resend.dev>',
      to: [email],
      subject: 'Jūsų prisijungimo kodas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Prisijungimo kodas</h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h2>
          </div>
          <p style="color: #666; text-align: center;">
            Šis kodas galioja 5 minutes. Jei neprašėte prisijungimo kodo, ignoruokite šį laišką.
          </p>
          <p style="color: #666; text-align: center; font-size: 12px;">
            Banko Sistema - Saugus prisijungimas
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      console.error('Email response:', emailResponse);
      throw new Error('Nepavyko išsiųsti el. laiško');
    }

    console.log(`Verification code sent to ${email}`, emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Patvirtinimo kodas išsiųstas į jūsų el. paštą'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('=== ERROR IN SEND-VERIFICATION-CODE ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Nepavyko išsiųsti patvirtinimo kodo'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);