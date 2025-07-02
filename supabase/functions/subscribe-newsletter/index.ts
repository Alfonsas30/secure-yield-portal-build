import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Newsletter subscription request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: SubscribeRequest = await req.json();
    console.log("Processing subscription for:", email);

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "LTB Bankas <onboarding@resend.dev>",
      to: [email],
      subject: "Sveiki atvykę į LTB Banko naujienlaiškį!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">LTB Bankas</h1>
            <p style="color: #64748b; font-size: 16px;">Ačiū, kad prenumeruojate mūsų naujienas!</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 15px;">Sveiki${name ? `, ${name}` : ''}!</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Džiaugiamės, kad prisijungėte prie LTB Banko bendruomenės. Dabar gausite:
            </p>
            <ul style="color: #475569; line-height: 1.6; padding-left: 20px;">
              <li>Naujienas apie palūkanų pokyčius</li>
              <li>Informaciją apie naujas paslaugas</li>
              <li>Ekskluzyvius pasiūlymus ir nuolaidas</li>
              <li>Finansų valdymo patarimus</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin-bottom: 10px;">💡 Patarimas</h3>
            <p style="color: #92400e; margin: 0;">
              Išbandykite mūsų skaičiuokles, kad sužinotumėte, kiek galėtumėte uždirbti su dienos palūkanomis!
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://ltb-bankas.lovable.app" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Eiti į LTB Banko svetainę
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
              Jei nebenorite gauti mūsų laiškų, galite 
              <a href="#" style="color: #2563eb;">atsisakyti prenumeratos</a>
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © 2024 LTB Bankas. Visi teisės saugomos.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);