import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiscountRequest {
  name: string;
  email: string;
  account_type: 'personal' | 'company';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, account_type }: DiscountRequest = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Store the discount request in database
    const { error: dbError } = await supabaseClient
      .from('discount_requests')
      .insert({
        name,
        email,
        account_type,
        status: 'pending'
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store discount request");
    }

    // Send email via FormSubmit
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('account_type', account_type);
    formData.append('_subject', `Nuolaidų užklausa - ${name}`);
    formData.append('_template', 'table');
    formData.append('_next', 'https://lattptcvghypdopbpxfr.supabase.co/functions/v1/request-discount');

    const response = await fetch('https://formsubmit.co/el/fuwaci', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    console.log("Discount request submitted successfully:", { name, email, account_type });

    return new Response(
      JSON.stringify({ success: true, message: "Nuolaidų užklausa sėkmingai išsiųsta" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in request-discount function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});