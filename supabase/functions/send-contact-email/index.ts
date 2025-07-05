import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

// GMAIL SMTP VERSION - PROPER IMPLEMENTATION
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Gmail SMTP email function started');
    console.log('🎯 PROJECT: latwptcvghypdopbpxfr');
    console.log('📧 Using Gmail SMTP with Denomailer');
    
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    
    console.log('🔑 Checking Gmail credentials:', {
      user: gmailUser ? 'Found' : 'Missing',
      password: gmailPassword ? 'Found' : 'Missing'
    });
    
    if (!gmailUser || !gmailPassword) {
      console.error('❌ Gmail credentials not configured');
      throw new Error('Gmail prisijungimo duomenys nesukonfigūruoti');
    }
    
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

    // Send email via Gmail SMTP
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log('📧 Gmail SMTP Configuration:');
    console.log('📧 From Gmail:', gmailUser);  
    console.log('📧 To Admin:', adminEmail);
    console.log('📧 Subject: Nauja žinutė iš LTB Bankas svetainės');
    
    // Prepare email content
    const emailSubject = `Nauja žinutė iš LTB Bankas svetainės - ${sanitizedName}`;
    const emailBody = `
Nauja kontaktų forma

Kontaktinė informacija:
Vardas: ${sanitizedName}
El. paštas: ${email}
${sanitizedPhone ? `Telefonas: ${sanitizedPhone}` : ''}

Žinutė:
${sanitizedMessage}

---
Ši žinutė buvo išsiųsta per LTB Bankas svetainės kontaktų formą.
    `.trim();

    console.log('🚀 STARTING GMAIL SMTP SEND...');
    
    // Create SMTP client for Gmail
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    console.log('📧 Connecting to Gmail SMTP...');
    
    // Send the email
    await client.send({
      from: gmailUser,
      to: adminEmail,
      subject: emailSubject,
      content: emailBody,
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

    await client.close();

    console.log("✅ GMAIL EMAIL SENT SUCCESSFULLY!");
    console.log("📧 Sent from Gmail:", gmailUser);
    console.log("📧 Sent to:", adminEmail);
    console.log('🎯 CHECK ADMIN GMAIL INBOX!');
    console.log("🔍 Look for subject:", emailSubject);

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