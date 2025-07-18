
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 DEBUG EMAIL FUNCTION STARTED');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY exists
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log('🔑 RESEND_API_KEY exists:', !!resendApiKey);
    console.log('🔑 RESEND_API_KEY length:', resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          details: "Missing API key in environment variables"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);
    console.log('📧 Resend client initialized');

    // Get admin email
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gmbhinvest333@gmail.com";
    console.log('🎯 Target email:', adminEmail);

    // Log email details before sending
    const emailSubject = `VILTB Email Test - ${new Date().toLocaleTimeString()}`;
    const emailContent = `Email test sent at: ${new Date().toLocaleString('lt-LT')}`;
    
    console.log('📧 ========== EMAIL SENDING DETAILS ==========');
    console.log('📧 From:', 'VILTB Bankas <noreply@viltb.com>');
    console.log('📧 To:', adminEmail);
    console.log('📧 Subject:', emailSubject);
    console.log('📧 Content Length:', emailContent.length, 'characters');
    console.log('📧 Timestamp:', new Date().toISOString());
    console.log('📧 Using verified VILTB domain');
    console.log('📧 Domain viltb.com should be verified in Resend');
    console.log('📧 =============================================');

    // Send test email with VILTB branding
    console.log('📤 Attempting to send test email...');
    const startTime = Date.now();
    
    const emailResponse = await resend.emails.send({
      from: `VILTB Bankas <noreply@viltb.com>`,
      to: [adminEmail],
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">📧 VILTB Email Test Success!</h1>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test sent at:</strong> ${new Date().toLocaleString('lt-LT')}</p>
            <p><strong>Function:</strong> debug-email</p>
            <p><strong>Target:</strong> ${adminEmail}</p>
            <p><strong>Domain:</strong> viltb.com (verified)</p>
            <p><strong>Sender:</strong> noreply@viltb.com</p>
          </div>
          <p style="color: #16a34a; font-weight: bold; text-align: center;">
            ✅ If you see this - VILTB email system works perfectly!
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            VILTB Banko Sistema - Patikimas ir saugus
          </p>
        </div>
      `,
    });

    const processingTime = Date.now() - startTime;

    console.log('📧 ========== RESEND API RESPONSE ==========');
    console.log('📧 Processing Time:', processingTime + 'ms');
    console.log('📧 Response Status:', emailResponse.error ? 'ERROR' : 'SUCCESS');
    
    if (emailResponse.data) {
      console.log('📧 Email ID:', emailResponse.data.id);
      console.log('📧 Created At:', emailResponse.data.created_at);
      console.log('📧 From:', emailResponse.data.from);
      console.log('📧 To:', emailResponse.data.to);
      console.log('📧 Subject:', emailResponse.data.subject);
    }
    
    console.log('📧 Full Response:', JSON.stringify(emailResponse, null, 2));
    console.log('📧 ==========================================');

    if (emailResponse.error) {
      console.error('❌ Resend API error:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed",
          details: emailResponse.error,
          resend_response: emailResponse
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('✅ DEBUG EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Email ID:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "VILTB debug email sent successfully",
        email_id: emailResponse.data?.id,
        sent_to: adminEmail,
        domain: "viltb.com",
        sender: "noreply@viltb.com",
        resend_response: emailResponse.data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ DEBUG EMAIL ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Debug email failed",
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
