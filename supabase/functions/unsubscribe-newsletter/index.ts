import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Unsubscribe request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Klaida</h1>
            <p>Neteisingas atsisakymo nuoroda.</p>
          </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find and update subscriber status
    const { data: subscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('unsubscribe_token', token)
      .eq('status', 'active')
      .single();

    if (findError || !subscriber) {
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Klaida</h1>
            <p>Prenumeratorius nerastas arba jau atsisakė prenumeratos.</p>
          </body>
        </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Update subscriber status to inactive
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'inactive' })
      .eq('unsubscribe_token', token);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully unsubscribed: ${subscriber.email}`);

    return new Response(
      `<html>
        <head>
          <title>Prenumeratos atsisakymas - LTB Bankas</title>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px;">LTB Bankas</h1>
            <h2 style="color: #16a34a; margin-bottom: 20px;">✓ Sėkmingai atsisakėte prenumeratos</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
              Jūsų el. pašto adresas <strong>${subscriber.email}</strong> pašalintas iš mūsų naujienlaiškio sąrašo.
              Daugiau nebegausite mūsų laiškų.
            </p>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
              Jei ateityje norėsite vėl prenumeruoti, galėsite tai padaryti mūsų svetainėje.
            </p>
            <a href="https://ltb-bankas.lovable.app" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Grįžti į svetainę
            </a>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in unsubscribe-newsletter function:", error);
    return new Response(
      `<html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">Klaida</h1>
          <p>Įvyko klaida apdorojant jūsų užklausą. Pabandykite dar kartą.</p>
        </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

serve(handler);