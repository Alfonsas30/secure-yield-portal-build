import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// FORCE REDEPLOYMENT - VERSION 3.0 - FIXED PROJECT ROUTING
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Contact email function started - CORRECT PROJECT');
    console.log('🎯 PROJECT CHECK: This should be latwptcvghypdopbpxfr');
    console.log('🏆 CURRENT FUNCTION: send-contact-email (NOT resend-email)');
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log('🔑 Checking RESEND_API_KEY:', resendApiKey ? 'Found' : 'Missing');
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      throw new Error('El. pašto paslauga nesukonfigūruota');
    }

    const resend = new Resend(resendApiKey);
    console.log('📧 Resend client initialized successfully');
    
    const { name, email, phone, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Prašome užpildyti visus privalomius laukus" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Input validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Netinkamas el. pašto formatas" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedName = name.replace(/[<>]/g, '').trim();
    const sanitizedMessage = message.replace(/[<>]/g, '').trim();
    const sanitizedPhone = phone?.replace(/[<>]/g, '').trim();

    // Send email to admin - Updated to force redeployment
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log(`📧 Current Supabase project: ${Deno.env.get("SUPABASE_URL")}`);
    console.log(`📧 ADMIN_EMAIL secret value: ${Deno.env.get("ADMIN_EMAIL") ? 'Set' : 'Not set'}`);
    console.log(`📧 Final recipient email: ${adminEmail}`);
    console.log(`📧 Sending contact email from: ${sanitizedName} (${email})`);
    console.log(`📧 Function: send-contact-email (not resend-email)`);

    const emailResponse = await resend.emails.send({
      from: "LTB Bankas <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Nauja žinutė iš LTB Bankas svetainės - ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Nauja kontaktų forma</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin-top: 0;">Kontaktinė informacija:</h3>
            <p><strong>Vardas:</strong> ${sanitizedName}</p>
            <p><strong>El. paštas:</strong> <a href="mailto:${email}">${email}</a></p>
            ${sanitizedPhone ? `<p><strong>Telefonas:</strong> ${sanitizedPhone}</p>` : ''}
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #1e293b; margin-top: 0;">Žinutė:</h3>
            <p style="white-space: pre-line; line-height: 1.6;">${sanitizedMessage}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              Ši žinutė buvo išsiųsta per LTB Bankas svetainės kontaktų formą.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Žinutė sėkmingai išsiųsta" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Nepavyko išsiųsti žinutės. Pabandykite dar kartą.",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);