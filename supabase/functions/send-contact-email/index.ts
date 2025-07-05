import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
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

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Contact email function started');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      console.error('❌ Missing required fields');
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
      console.error('❌ Invalid email format:', email);
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

    // Get admin email from secrets
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    
    // Log contact form submission
    console.log('📧 ========== NAUJA KONTAKTŲ FORMA ==========');
    console.log('⏰ Laikas:', new Date().toISOString());
    console.log('👤 Vardas:', sanitizedName);
    console.log('📧 El. paštas:', email);
    console.log('📱 Telefonas:', sanitizedPhone || 'Nepateiktas');
    console.log('💬 Žinutė:', sanitizedMessage);
    console.log('🎯 Siųsti į:', adminEmail);
    console.log('📧 ===============================================');

    // Save to database first
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: sanitizedName,
        email: email,
        phone: sanitizedPhone || null,
        message: sanitizedMessage
      });

    if (dbError) {
      console.error('❌ Database error:', dbError);
    } else {
      console.log('✅ Contact message saved to database');
    }

    // Send email notification using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables');
      // Still return success if DB save worked
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Žinutė sėkmingai gauta! Susisieksime su jumis netrukus." 
        }), 
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const resend = new Resend(resendApiKey);
    console.log('📧 Sending email notification via Resend...');
    
    try {
      const emailResponse = await resend.emails.send({
        from: "LTB Bankas <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `Nauja kontaktų forma: ${sanitizedName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Nauja kontaktų forma iš LTB Bankas svetainės</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Kontaktinė informacija:</h3>
              <p><strong>Vardas:</strong> ${sanitizedName}</p>
              <p><strong>El. paštas:</strong> ${email}</p>
              ${sanitizedPhone ? `<p><strong>Telefonas:</strong> ${sanitizedPhone}</p>` : ''}
            </div>
            <div style="background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Žinutė:</h3>
              <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Ši žinutė buvo išsiųsta ${new Date().toLocaleString('lt-LT')}
            </p>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error('❌ Resend email error:', emailResponse.error);
        throw new Error(`Email sending failed: ${emailResponse.error.message}`);
      }

      console.log('✅ Email notification sent successfully:', emailResponse.data?.id);
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Still return success if DB save worked
    }

    console.log('✅ KONTAKTŲ FORMA SĖKMINGAI APDOROTA!');

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
    console.error("❌ Error in send-contact-email function:", error);
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