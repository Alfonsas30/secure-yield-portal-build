
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SEND-CONTACT-EMAIL FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("El. pašto paslauga nesukonfigūruota");
    }

    const resend = new Resend(resendApiKey);
    console.log('Resend client initialized for contact email');

    const { name, email, subject, message }: ContactRequest = await req.json();
    console.log("Contact request:", { name, email, subject, messageLength: message?.length });

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Visi laukai yra privalomi" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log(`Sending contact email to admin: ${adminEmail}`);

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [adminEmail],
      subject: `Kontakto forma: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Nauja žinutė iš kontakto formos</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Vardas:</strong> ${name}</p>
            <p><strong>El. paštas:</strong> ${email}</p>
            <p><strong>Tema:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <p><strong>Žinutė:</strong></p>
            <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            VILTB Banko sistema - Kontakto forma
          </p>
        </div>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Error sending admin email:", adminEmailResponse.error);
      throw new Error("Nepavyko išsiųsti pranešimo administratoriui");
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "VILTB Bankas <noreply@viltb.com>",
      to: [email],
      subject: "Gavome jūsų žinutę - VILTB Bankas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Ačiū už jūsų žinutę!</h1>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p>Sveiki, <strong>${name}</strong>!</p>
            <p>Gavome jūsų žinutę tema "<strong>${subject}</strong>" ir atsakysime į ją kuo greičiau.</p>
            <p>Paprastai atsakome per 1-2 darbo dienas.</p>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Jūsų žinutės kopija:</strong></p>
            <p style="color: #6b7280; font-style: italic; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            VILTB Banko sistema - Patikimas ir saugus<br>
            Jei turite skubų klausimą, galite skambinti mums telefonu arba atvykti į skyrių.
          </p>
        </div>
      `,
    });

    console.log("Contact emails sent successfully:", {
      admin: adminEmailResponse.data?.id,
      user: userEmailResponse.data?.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Jūsų žinutė sėkmingai išsiųsta. Atsakysime kuo greičiau!" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Nepavyko išsiųsti žinutės" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
