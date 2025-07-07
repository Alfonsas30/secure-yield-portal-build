
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== VERIFY CODE STARTED ===');
    console.log('Request method:', req.method);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { email, code }: VerifyRequest = requestBody;

    console.log(`Verifying code for email: ${email}`, { code: code ? 'present' : 'missing' });

    // Find the verification code
    const { data: verificationData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verificationData) {
      console.log('Invalid or expired code - fetchError:', fetchError);
      console.log('verificationData:', verificationData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Neteisingas arba pasibaigęs kodas'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check attempts limit (max 3 attempts)
    if (verificationData.attempts >= 3) {
      console.log('Too many attempts');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Per daug bandymų. Prašykite naujo kodo'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ 
        used: true, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', verificationData.id);

    if (updateError) {
      console.error('Error updating verification code:', updateError);
      throw new Error('Nepavyko atnaujinti patvirtinimo kodo');
    }

    // Update user's MFA status if user_id exists
    if (verificationData.user_id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          mfa_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', verificationData.user_id);

      if (profileError) {
        console.error('Error updating profile MFA status:', profileError);
      }
    }

    // Cleanup expired codes
    await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());

    console.log(`Code verified successfully for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Kodas sėkmingai patikrintas',
        user_id: verificationData.user_id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('=== ERROR IN VERIFY-CODE ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Nepavyko patikrinti kodo'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
