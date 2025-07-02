import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DiscountRequest {
  name: string;
  email: string;
  account_type: 'personal' | 'company';
}

serve(async (req) => {
  console.log("=== REQUEST-DISCOUNT FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ 
        status: "Request-discount function is running",
        timestamp: new Date().toISOString(),
        environment: {
          supabaseUrl: !!Deno.env.get("SUPABASE_URL"),
          resendKey: !!Deno.env.get("RESEND_API_KEY")
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    const requestBody = await req.json();
    console.log("Request body received:", requestBody);
    
    const { name, email, account_type }: DiscountRequest = requestBody;

    console.log("Processing discount request for:", { name, email, account_type });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Storing request in database...");

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

    console.log("Database insert successful, preparing email...");

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY exists:", !!resendApiKey);
    console.log("RESEND_API_KEY length:", resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }
    
    const resend = new Resend(resendApiKey);
    
    const accountTypeText = account_type === 'personal' ? 'Asmeninė sąskaita' : 'Įmonės sąskaita';
    const discountText = account_type === 'personal' ? '800 € → 400 € (50% nuolaida)' : '1500 € → 750 € (50% nuolaida)';

    console.log("Sending email with Resend...");
    console.log("Email details:", { 
      from: "GMB Invest <onboarding@resend.dev>",
      to: ["gmbhinvest333@gmail.com"],
      subject: `Nauja nuolaidų užklausa - ${name}`
    });

    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
      from: "GMB Invest <onboarding@resend.dev>",
      to: ["gmbhinvest333@gmail.com"],
      subject: `Nauja nuolaidų užklausa - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            Nauja nuolaidų užklausa
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Kliento informacija:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 30%;">Vardas, pavardė:</td>
                <td style="padding: 8px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">El. paštas:</td>
                <td style="padding: 8px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Sąskaitos tipas:</td>
                <td style="padding: 8px;">${accountTypeText}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Nuolaidos suma:</td>
                <td style="padding: 8px; color: #4CAF50; font-weight: bold;">${discountText}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Veiksmai:</h4>
            <p style="margin: 10px 0;">1. Patikrinkite kliento duomenis</p>
            <p style="margin: 10px 0;">2. Sukurkite nuolaidos kodą sistemoje</p>
            <p style="margin: 10px 0;">3. Išsiųskite kodą klientui per 24 valandas</p>
          </div>
          
          <div style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Ši užklausa buvo automatiškai išsiųsta iš GMB Invest sistemos
          </div>
        </div>
      `,
    });

      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.error("Email error details:", JSON.stringify(emailError, null, 2));
      
      // Still return success since the request was saved to database
      // But log the email failure for debugging
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Nuolaidų užklausa sėkmingai išsiųsta (el. paštas siunčiamas atskirai)",
          emailError: emailError.message 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
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