import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Send email via Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const accountTypeText = account_type === 'personal' ? 'Asmeninė sąskaita' : 'Įmonės sąskaita';
    const discountText = account_type === 'personal' ? '800 € → 400 € (50% nuolaida)' : '1500 € → 750 € (50% nuolaida)';

    const emailResponse = await resend.emails.send({
      from: "GMB Invest <gmbhinvest333@gmail.com>",
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