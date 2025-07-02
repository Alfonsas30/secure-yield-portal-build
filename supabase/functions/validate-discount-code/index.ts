import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCodeRequest {
  code: string;
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email }: ValidateCodeRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if discount code exists and is valid
    const { data: discountCode, error } = await supabaseClient
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('email', email)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !discountCode) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: "Nuolaidos kodas nerastas, nebegalioja arba jau panaudotas" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("Valid discount code found:", { code, email, discount: discountCode.discount_percent });

    return new Response(
      JSON.stringify({ 
        valid: true, 
        discount_percent: discountCode.discount_percent,
        message: `Nuolaida ${discountCode.discount_percent}% pritaikyta!`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in validate-discount-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});