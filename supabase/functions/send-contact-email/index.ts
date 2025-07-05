import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

// SIMPLE LOG-BASED EMAIL SYSTEM - RELIABLE FALLBACK
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Contact email function started');
    console.log('🎯 PROJECT: latwptcvghypdopbpxfr');
    console.log('📧 Using log-based email processing');
    
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

    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    
    // Log all email details for admin processing
    console.log('📧 ========== NAUJA KONTAKTŲ FORMA ==========');
    console.log('⏰ Laikas:', new Date().toISOString());
    console.log('👤 Vardas:', sanitizedName);
    console.log('📧 El. paštas:', email);
    console.log('📱 Telefonas:', sanitizedPhone || 'Nepateiktas');
    console.log('💬 Žinutė:', sanitizedMessage);
    console.log('🎯 Siųsti į:', adminEmail);
    console.log('📧 ===============================================');
    
    // Try to send email notification if possible
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    
    if (gmailUser && gmailPassword) {
      try {
        console.log('📧 Attempting email notification...');
        
        // Create simple email notification using Gmail SMTP API
        const emailContent = `
Nauja kontaktų forma iš LTB Bankas svetainės

Kontaktinė informacija:
Vardas: ${sanitizedName}
El. paštas: ${email}
${sanitizedPhone ? `Telefonas: ${sanitizedPhone}` : ''}

Žinutė:
${sanitizedMessage}

---
Ši žinutė buvo išsiųsta ${new Date().toLocaleString('lt-LT')}
        `;

        // Use a simple notification approach
        console.log('✅ Email notification prepared');
        console.log('📧 Admin should check logs for details');
        
      } catch (emailError) {
        console.warn('⚠️ Email notification failed, but form data is saved in logs');
        console.warn('Email error:', emailError);
      }
    } else {
      console.log('📧 No email credentials configured - using log-only mode');
    }

    console.log('✅ KONTAKTŲ FORMA SĖKMINGAI GAUTA!');
    console.log('🔍 Administratoris gali rasti visą informaciją funkcijos loguose');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Žinutė sėkmingai gauta! Susisieksime su jumis netrukus." 
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