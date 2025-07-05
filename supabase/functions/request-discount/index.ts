import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("=== REQUEST-DISCOUNT FUNCTION STARTED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST method allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { name, email, account_type } = body;

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Saving to database...");

    // Store the discount request
    const { error: dbError } = await supabase
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

    console.log("Database save successful");

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("El. pašto paslauga nesukonfigūruota");
    }
    
    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized for discount request');
    
    const accountTypeText = account_type === 'personal' ? 'Asmeninė sąskaita' : 'Įmonės sąskaita';
    const discountText = account_type === 'personal' ? '800 € → 400 € (50% nuolaida)' : '1500 € → 750 € (50% nuolaida)';

    console.log("Sending email...");

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log(`Sending discount request to admin: ${adminEmail}`);
    
    const emailResponse = await resend.emails.send({
      from: "LTB Bankas <hello@viltb.com>",
      to: [adminEmail],
      subject: `Nauja nuolaidų užklausa - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Nauja nuolaidų užklausa</h2>
          <p><strong>Vardas:</strong> ${name}</p>
          <p><strong>El. paštas:</strong> ${email}</p>
          <p><strong>Sąskaitos tipas:</strong> ${accountTypeText}</p>
          <p><strong>Nuolaidos suma:</strong> ${discountText}</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Nuolaidų užklausa sėkmingai išsiųsta" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});